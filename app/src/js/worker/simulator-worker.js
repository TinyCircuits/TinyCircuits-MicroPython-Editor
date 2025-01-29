import {loadMicroPython} from "../micropython.mjs"
import BusyWorkerReceiver from "./busy_worker_receiver.js";
import dbgconsole from "../dbgconsole.js";


async function writeFilesystemFile(mp, fetchPath, filePath){

    // Create the path to the file
    let path = filePath.substring(0, filePath.lastIndexOf("/"));
    mp.FS.mkdirTree(path);

    // Get the file and write it
    let data = await (await fetch(fetchPath)).arrayBuffer();
    data = new Uint8Array(data);
    mp.FS.writeFile(filePath, data);
}


async function writeManifestToFilesystem(remove, manifestText){
    let manifestLines = manifestText.split(/\r\n|\r|\n/);

    for(let i=0; i<manifestLines.length; i++){
        let line = manifestLines[i];

        if(line == ""){
            continue;
        }

        let filePath = line.replace("/simulator/", "");

        console.log(filePath);
        await writeFilesystemFile(mp, line, filePath);
    }
}


async function writeDefaultFilesystem(mp){
    console.log("Writing files for simulator default filesystem...");
    
    await writeManifestToFilesystem("/simulator/", await (await fetch("/simulator/system/manifest.txt")).text());
    await writeManifestToFilesystem("/simulator/", await (await fetch("/simulator/lib/manifest.txt")).text());

    mp.FS.mkdirTree("/Games");
    console.log(mp.FS.readdir("/"));
}



// While building tree to represent simulator file system,
// some paths should not be included
const isPathExcluded = (localPath, fullPath) => {
    if(localPath != "." && localPath != ".." && fullPath != "/." && fullPath != "/.." && fullPath != "/tmp" && fullPath != "/home" && fullPath != "/dev" && fullPath != "/proc"){
        return false;
    }else{
        return true;
    }
}


// Builds list/dict tree structure in format needed
// for display in custom file panel
const getTree = (path, content) => {
    let dirElements = mp.FS.readdir(path);

    dirElements.forEach(element => {
        let fullElementPath = (path == "/") ? (path + element) : (path + "/" + element);

        if(isPathExcluded(element, fullElementPath) == false){
            let stat = mp.FS.lstat(fullElementPath);
            let isFile = stat.mode == 33206;
            let isFolder = stat.mode == 16895;

            if(isFile){
                content.push({name:element, path:fullElementPath, size:mp.FS.lstat(fullElementPath).size});
            }else if(isFolder){
                let subContent = [];
                content.push({name:element, path:fullElementPath, content:subContent});
                getTree(fullElementPath, subContent);
            }
        }
    });

    return content;
}


// Returns a list of all folders and files with absolute paths
// and file data
const getFs = (path, list) => {
    let dirElements = mp.FS.readdir(path);

    dirElements.forEach(element => {
        let fullElementPath = (path == "/") ? (path + element) : (path + "/" + element);

        if(isPathExcluded(element, fullElementPath) == false){
            let stat = mp.FS.lstat(fullElementPath);
            let isFile = stat.mode == 33206;
            let isFolder = stat.mode == 16895;

            if(isFile){
                list.push({name:element, path:fullElementPath, size:mp.FS.lstat(fullElementPath).size, data:mp.FS.readFile(fullElementPath, {encoding:"binary"})});
            }else if(isFolder){
                list.push({name:element, path:fullElementPath});
                getFs(fullElementPath, list);
            }
        }
    });

    return list;
}


async function run(path_to_run){
    // Get the full path to the directory where the main file lives
    let run_dir_path = path_to_run.substring(0, path_to_run.lastIndexOf("/"));

    // Change to directory of file being executed
    try{
        console.log("Trying to run file in simulator...");

        await mp.runPythonAsync(`
import sys
import os
import engine_save
engine_save._init_saves_dir("/Saves/` + run_dir_path + `")
sys.path.append("` + run_dir_path + `")
os.chdir("` + run_dir_path + `")
print("`+ path_to_run +`")
execfile("` + path_to_run + `")
`);
    }catch(error){
        if(error.name == "PythonError"){
            // https://stackoverflow.com/a/52947649
            let lines = error.message.split(/\r\n|\r|\n/);
            lines.forEach(line => {
                if(line.length > 0){
                    mp_stderr(line);
                }
            });
        }else{
            console.error(error);
        }
    }
}


let receiver = undefined;

const mp_stdout = (line) => {
    receiver.send("print_update", line);
};

const mp_stderr = (line) => {
    receiver.send("print_update", line);
};

const mp_stdin = () => {
    // This doesn't ever seem to get called
}

console.log("Loading simulator!");
const mp = await loadMicroPython({stdout:mp_stdout, stderr:mp_stderr, stdin:mp_stdin, heapsize:((520*1000) + (2*1024*1024)), linebuffer:false});
console.log("Simulator loaded!");

// Communication link to main thread
receiver = new BusyWorkerReceiver();

receiver.registerBufferChannel("pressed_buttons", undefined, () => {
    dbgconsole("Got indication that buttons were pressed!");
    let buttons_mask = receiver.getu16("pressed_buttons", 0);
    return buttons_mask;
});

receiver.registerBufferChannel("typed", undefined, () => {
    dbgconsole("Typed", receiver.getu8("typed", 0));
    mp.replProcessChar(receiver.getu8("typed", 0));
    receiver.clear("typed");
});

receiver.registerBufferChannel("screen_update", undefined, undefined);

receiver.registerBufferChannel("get_tree", undefined, () => {
    dbgconsole("Replying with simulator tree...");
    receiver.send("get_tree", getTree("/", []));
});

receiver.registerBufferChannel("init_fs", undefined, () => {
    dbgconsole("Setting up fs first time");
    writeDefaultFilesystem(mp);
});

receiver.registerBufferChannel("get_fs", undefined, () => {
    dbgconsole("Replying with simulator tree...");
    receiver.send("get_fs", getFs("/", []));
});

receiver.registerBufferChannel("set_progress", undefined, undefined);
receiver.registerBufferChannel("end_progress", undefined, undefined);

receiver.registerBufferChannel("upload_files_and_run", undefined, (filesAndPath) => {
    dbgconsole("Got files");
    
    let files_list = filesAndPath["filesList"];
    let run_path = filesAndPath["runPath"];

    // Write the actual files to the simulator
    for(let ifx=0; ifx<files_list.length; ifx++){
        
        if(files_list[ifx].data != undefined){
            // Get the path to the file
            let file_path = files_list[ifx].path.substring(0, files_list[ifx].path.lastIndexOf("/"));
            mp.FS.mkdirTree(file_path);
            mp.FS.writeFile(files_list[ifx].path, files_list[ifx].data);
        }else{
            mp.FS.mkdirTree(files_list[ifx].path);
        }

        dbgconsole("Wrote " + files_list[ifx].path + " to simulator filesystem");
        postMessage({message_type:"worker_set_progress", value:(ifx/(files_list.length-1))})
        receiver.send("set_progress", (ifx/(files_list.length-1)));
    }

    receiver.send("end_progress", undefined);

    run(run_path);
});


receiver.registerBufferChannel("main_needs_audio", undefined, () => {

});


// This JS function is called from C code in micropython
// using the VM hook in mpportconfig.h. This allows for
// doing anything while only micropython is running
// and not just the engine 
self.main_call = () => {
    dbgconsole("Main!");
    receiver.post(receiver.POST_MESSAGE_TYPE_STALLED, undefined, undefined);
    receiver.check("typed");
    receiver.check("get_tree");
    receiver.check("get_fs");
}

// This JS function is called from C code in the engine
self.get_pressed_buttons = () => {
    return receiver.check("pressed_buttons");
}

// This JS function is called from C code in the engine
self.update_display = (screen_buffer_to_render_ptr) => {
    for(let ipx=0; ipx<128*128*2; ipx++){
        receiver.setu8("screen_update", ipx, mp._module.HEAPU8[screen_buffer_to_render_ptr+ipx]);
    }

    // This will always post a message since the worker flag will always be false
    receiver.mark("screen_update");
}


mp.replInit();