import {loadMicroPython} from "./micropython.mjs"

const stdoutWriter = (line) => {
    postMessage({message_type:"print_update", value:line});
};

let web_pressed_buttons_buffer = undefined;
let screen_buffer = undefined;
let typed_chars_buffer = undefined;

let files_list = [];
let path_to_run = "";

// const mp = await loadMicroPython({stdout:stdoutWriter});

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

    // console.log(mp.FS.readdir("/"));
}

// writeFilesystem();

async function test(){

    const mp = await loadMicroPython({stdout:stdoutWriter});

    await writeDefaultFilesystem(mp);

    for(let ifx=0; ifx<files_list.length; ifx++){
        // Create the path to the file
        let path = files_list[ifx].path.substring(0, files_list[ifx].path.lastIndexOf("/"));
        mp.FS.mkdirTree(path);

        mp.FS.writeFile(files_list[ifx].path, files_list[ifx].data);
        // console.log(new TextDecoder().decode(mp.FS.readFile(files_list[ifx].path)))
        // // Get the file and write it
        // if(files_list[ifx].path.indexOf(".bmp") != -1 || files_list[ifx].path.indexOf(".wav") != -1){
        //     mp.FS.writeFile(files_list[ifx].path, files_list[ifx].data, {encoding:"binary"});
        // }else{
        //     mp.FS.writeFile(files_list[ifx].path, files_list[ifx].data, {encoding:"utf8"});
        // }
        
        console.log("Wrote " + files_list[ifx].path + " to simulator filesystem");
    }

    // This JS function is called from C code in micropython
    // using the VM hook in mpportconfig.h. This allows for
    // doing anything while only micropython is running
    // and not just the engine 
    self.get_serial = () => {
        let typed_chars = new Uint8Array(typed_chars_buffer);

        if(typed_chars[0] == 1){
            console.log(typed_chars);

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

    // console.log(mp)
    // console.log(mp.FS)
    // console.log(mp.FS.readdir("/"))

    let run_dir_path = path_to_run.substring(0, path_to_run.lastIndexOf("/"));

    // Change to directory of file being executed
    await mp.runPythonAsync(`
import os
os.chdir("` + run_dir_path + `")
`);

    mp.runPythonAsync("execfile(\"" + path_to_run + "\")");
}


onmessage = (e) => {
    if(e.data.message_type == "screen_buffer_set"){
        screen_buffer = e.data.value;
    }else if(e.data.message_type == "pressed_buttons_buffer_set"){
        web_pressed_buttons_buffer = e.data.value;
    }else if(e.data.message_type == "typed_chars_buffer_set"){
        typed_chars_buffer = e.data.value;
    }else if(e.data.message_type == "files"){
        files_list = e.data.value;
    }else if(e.data.message_type == "run"){
        path_to_run = e.data.value;
        test();
    }
};