import {loadMicroPython} from "./micropython.mjs"

const stdout = (line) => {
    postMessage({message_type:"print_update", value:line});
};

const stderr = (line) => {
    postMessage({message_type:"print_update", value:line});
};

let web_pressed_buttons_buffer = undefined;
let stop_buffer = undefined;
let screen_buffer = undefined;
let typed_chars_buffer = undefined;

let path_to_run = "";

async function writeFilesystemFile(mp, fetchPath, filePath){

    // Create the path to the file
    let path = filePath.substring(0, filePath.lastIndexOf("/"));
    mp.FS.mkdirTree(path);

    // Get the file and write it
    let data = await (await fetch(fetchPath)).arrayBuffer();
    data = new Uint8Array(data);
    mp.FS.writeFile(filePath, data);
}


async function writeDefaultFilesystem(mp){
    await writeFilesystemFile(mp, "./simulator/filesystem/system/assets/outrunner_outline.bmp", "system/assets/outrunner_outline.bmp");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/arrow.bmp", "system/launcher/assets/arrow.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/battery.bmp", "system/launcher/assets/battery.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-background.bmp", "system/launcher/assets/launcher-background.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-credits-header.bmp", "system/launcher/assets/launcher-credits-header.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-games-header.bmp", "system/launcher/assets/launcher-games-header.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-header-island.bmp", "system/launcher/assets/launcher-header-island.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-screen-credits-icon.bmp", "system/launcher/assets/launcher-screen-credits-icon.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-screen-gear-icon.bmp", "system/launcher/assets/launcher-screen-gear-icon.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-screen-thumby-color-icon.bmp", "system/launcher/assets/launcher-screen-thumby-color-icon.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-settings-header.bmp", "system/launcher/assets/launcher-settings-header.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/assets/launcher-tile-qmark.bmp", "system/launcher/assets/launcher-tile-qmark.bmp");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/battery_indicator.py", "system/launcher/battery_indicator.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/credits_screen.py", "system/launcher/credits_screen.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/custom_camera.py", "system/launcher/custom_camera.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/direction_icon.py", "system/launcher/direction_icon.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/dynamic_background.py", "system/launcher/dynamic_background.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/games_screen.py", "system/launcher/games_screen.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/header.py", "system/launcher/header.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/launcher.py", "system/launcher/launcher.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/screen_icon.py", "system/launcher/screen_icon.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher/settings_screen.py", "system/launcher/settings_screen.py");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/b.bmp", "system/splash/assets/b.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/C.bmp", "system/splash/assets/C.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/GO.bmp", "system/splash/assets/GO.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/h.bmp", "system/splash/assets/h.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/L.bmp", "system/splash/assets/L.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/m.bmp", "system/splash/assets/m.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/R.bmp", "system/splash/assets/R.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/RO.bmp", "system/splash/assets/RO.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/T.bmp", "system/splash/assets/T.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/u.bmp", "system/splash/assets/u.bmp");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/assets/y.bmp", "system/splash/assets/y.bmp");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/show_splash.py", "system/splash/show_splash.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/splash/splash.py", "system/splash/splash.py");

    await writeFilesystemFile(mp, "./simulator/filesystem/system/crash.py", "system/crash.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/credits_1_testers.csv", "system/credits_1_testers.csv");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/credits_2_collectors.csv", "system/credits_2_collectors.csv");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/credits_3_special.csv", "system/credits_3_special.csv");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/launcher_state.py", "system/launcher_state.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/run_on_boot.py", "system/run_on_boot.py");
    await writeFilesystemFile(mp, "./simulator/filesystem/system/util.py", "system/util.py");

    await writeFilesystemFile(mp, "./simulator/filesystem/main.py", "main.py");

    // Create empty games directory
    mp.FS.mkdirTree("/Games");

    // console.log(mp.FS.readdir("/"));
}


const stdin = () => {
    console.log("STDIN TEST");
}


const stop = () => {
    console.log("Stopping simulator");
    postMessage({message_type:"fs", value:getFs("/", [])});
    self.close();
}


console.log("Loading simulator!");
const mp = await loadMicroPython({stdout:stdout, stderr:stderr, stdin:stdin, heapsize:((520*1000) + (2*1024*1024)), linebuffer:false});
await writeDefaultFilesystem(mp);
await mp.replInit();

// This JS function is called from C code in micropython
// using the VM hook in mpportconfig.h. This allows for
// doing anything while only micropython is running
// and not just the engine 
self.main_call = () => {
    // If the stop buffer is being told to stop, then stop
    if(stop_buffer[0] == 1){
        stop_buffer[0] = 0;
        stop();
    }

    let typed_chars = new Uint8Array(typed_chars_buffer);

    if(typed_chars[0] == 1){
        // Process all buffered chars until see one that's 0, then stop
        for(let i=1; i<typed_chars.length; i++){
            if(typed_chars[i] == 0){
                break;
            }else{
                mp.replProcessChar(typed_chars[i]);
            }
        }

        // Tell the page we're ready for more data
        typed_chars[0] = 0;
        postMessage({message_type:"ready_for_more_typed_chars"});
    }
}

// This JS function is called from C code in the engine
self.get_pressed_buttons = () => {
    let web_pressed_buttons = new Uint16Array(web_pressed_buttons_buffer)
    return web_pressed_buttons[0];
}

// This JS function is called from C code in the engine
self.update_display = (screen_buffer_to_render_ptr) => {
    let buffer = new Uint8Array(screen_buffer);

    for(let ipx=0; ipx<128*128*2; ipx++){
        buffer[ipx] = mp._module.HEAPU8[screen_buffer_to_render_ptr+ipx];
    }

    postMessage({message_type:"screen_update"});
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


async function run(){
    // Get the full path to the directory where the main file lives
    let run_dir_path = path_to_run.substring(0, path_to_run.lastIndexOf("/"));

    // Change to directory of file being executed
    try{
        await mp.runPythonAsync(`
import sys
import os
import engine_save
engine_save._init_saves_dir("/Saves/` + run_dir_path + `")
sys.path.append("` + run_dir_path + `")
os.chdir("` + run_dir_path + `")
execfile("` + path_to_run + `")
`);
    }catch(error){
        if(error.name == "PythonError"){
            // https://stackoverflow.com/a/52947649
            let lines = error.message.split(/\r\n|\r|\n/);
            lines.forEach(line => {
                if(line.length > 0){
                    stderr(line);
                }
            });
        }else{
            console.error(error);
        }
    }
}


onmessage = (e) => {
    if(e.data.message_type == "stop_buffer_set"){
        stop_buffer = e.data.value;
    }else if(e.data.message_type == "screen_buffer_set"){
        screen_buffer = e.data.value;
    }else if(e.data.message_type == "pressed_buttons_buffer_set"){
        web_pressed_buttons_buffer = e.data.value;
    }else if(e.data.message_type == "typed_chars_buffer_set"){
        typed_chars_buffer = e.data.value;
    }else if(e.data.message_type == "files"){
        let files_list = e.data.value;

        console.log(files_list);
        
        // Write the actual files to the simulator
        for(let ifx=0; ifx<files_list.length; ifx++){
            // Create the path to the file
            let path = files_list[ifx].path.substring(0, files_list[ifx].path.lastIndexOf("/"));
            mp.FS.mkdirTree(path);
            if(files_list[ifx].data != undefined){
                mp.FS.writeFile(files_list[ifx].path, files_list[ifx].data);
            }
            console.log("Wrote " + files_list[ifx].path + " to simulator filesystem");
            postMessage({message_type:"worker_set_progress", value:(ifx/(files_list.length-1))})
        }

        postMessage({message_type:"worker_end_progress"});
    }else if(e.data.message_type == "stop"){
        stop();
    }else if(e.data.message_type == "tree"){
        postMessage({message_type:"tree", value:getTree("/", [])});
    }else if(e.data.message_type == "typed"){
        self.main_call();
    }else if(e.data.message_type == "run"){
        path_to_run = e.data.value;
        run();
    }
};

// Let the main thread know the worker is ready
postMessage({message_type:"ready"})