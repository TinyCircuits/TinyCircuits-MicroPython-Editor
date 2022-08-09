import { Layout } from "../../../modules/layout/layout.js";
import { Console } from "../../../modules/console/console.js";
import { WorkspaceSelection } from "../../../modules/workspace-selection/workspace-selection.js";
import { Projects } from "../../../modules/projects/projects.js";
import { CodeEditor } from "../../../modules/code-editor/code-editor.js";
import { Serial } from "../../../modules/serial/serial.js";
import { Repl } from "../../../modules/repl/repl.js";
import { Emulator } from "../../../modules/emulator/emulator.js";
import { SpriteEditorManager } from "../../../modules/sprite-editor/sprite-editor-manager.js";


let divLayout = document.getElementById("divLayout");

let layout = new Layout(divLayout);
let consoleWorkspace = new WorkspaceSelection([["btnThumbyConsole", ["divThumbyConsole", "divRunOnThumby"]], ["btnBrowserConsole", ["divBrowserConsole", "divRunInBrowser"]]]);


let codeEditor = new CodeEditor("divCodeEditor");
let spriteEditorManager = new SpriteEditorManager();

let projects = new Projects("divProjects", codeEditor, spriteEditorManager);

let mainWorkspace = new WorkspaceSelection([["btnCode", ["divCode"]], 
                                            ["btnSprite", ["divSprite"], () => {spriteEditorManager.shown = true;}, () => {spriteEditorManager.shown = false;}],
                                            ["btnMusic", ["divMusic"]]]);


let thumbyConsole = new Console(document.getElementById("divThumbyConsole"), "Thumby console\r\n");
let browserConsole = new Console(document.getElementById("divBrowserConsole"), "Browser console\r\n");


let emulator = new Emulator();
emulator.onOutput = (data) => {
    browserConsole.write(data);
}
browserConsole.onType = (data) => {
    emulator.write(data);
}

let btnRunInBrowser = document.getElementById("btnRunInBrowser");
btnRunInBrowser.onclick = async (event) => {
    emulator.startEmulator(await projects.projects[0].getAllFiles(), projects.projects[0].projectName);
}


// For some reason, Mac OS makes the PID show up as 10 for Thumby, sometimes
let repl = new Repl();
let serial = new Serial([{usbVendorId: 11914, usbProductId: 5}, {usbVendorId:11914, usbProductId: 10}]);

// When serial is connected and gets data from a device, filter it through REPL first before outputting to the console
serial.onData = (data) => {
    repl.consumeData(data);
}

// When serial connects, allow repl to go through connection procedure
serial.onConnect = async () => {
    await repl.connected();
}

// REPL module filtered the incoming serial data, output to console
repl.onOutput = (data) => {
    thumbyConsole.write(data);
}

repl.onWrite = async (data, encode) => {
    await serial.write(data, encode);
}


thumbyConsole.onType = async (data) => {
    await serial.write(data);
}


document.getElementById("btnResetLayout").onclick = (event) => {
    layout.resetLayoutSize();
    spriteEditorManager.resetLayoutSize();
    emulator.resetLayoutSize();
}


document.getElementById("btnProjectAddFiles").onclick = (event) => {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    input.onchange = (event) => { 
        let files = event.target.files;

        let close = window.folderSelectionShow("Use the \"Projects\" panel on the left to choose a folder for the files", () => {
            projects.unsetFromFolderSelectionMode();
        });

        projects.setToFolderSelectionMode(files, () => {
            projects.unsetFromFolderSelectionMode();
            close();
        });
    }

    input.click();
}


document.getElementById("btnStartMainMenu").onclick = async (event) => {
    if(!serial.connected){
        await serial.connect();
    }

    await repl.getMainMenu();
}


document.getElementById("btnRunOnThumby").onclick = async (event) => {
    if(!serial.connected){
        await serial.connect();
    }

    savingMethod.method = "Thumby";
    savingMethod.module = repl;

    await saveCurrentProject(() => {
        let projectName = projects.projects[0].projectName;
        let path = "/Games/" + projectName + "/" + projectName + ".py";
        
        repl.executeFile(path);
    });
}


document.getElementById("btnStopThumby").onclick = async (event) => {
    if(!serial.connected){
        await serial.connect();
    }

    repl.stop();
}




let savingMethod = {method: undefined, module: undefined};


let saveCurrentProject = async (callback = () => {}) => {
    let project = projects.projects[0];

    if(savingMethod.module == undefined){
        if(savingMethod.method == "PC"){
            savingMethod.module = await window.showDirectoryPicker({mode: "readwrite"});
        }else if(savingMethod.method == "Thumby"){
            savingMethod.module = repl;
        }
    }

    if(savingMethod.method == "PC"){
        project.savePC(savingMethod.module);
    }else if(savingMethod.method == "Thumby"){
        if(!serial.connected){
            await serial.connect();
        }

        await repl.startSaveFileMode(async () => {
            await project.saveThumby(savingMethod.module, callback);
        });
    }
}


document.getElementById("btnSaveToDialogPC").onclick = (event) => {
    savingMethod.method = "PC";
    saveCurrentProject()
};

document.getElementById("btnSaveToDialogThumby").onclick = (event) => {
    savingMethod.method = "Thumby";
    saveCurrentProject()
};


document.addEventListener("keydown", (event) => {
    if(event.code == "KeyS" && event.ctrlKey){
        event.preventDefault();
        if(savingMethod.method == undefined){
            document.getElementById("btnSaveProjectTo").click()
        }else{
            console.log("Save to " + savingMethod.method);
            saveCurrentProject();
        }
    }
});


document.getElementById("btnCreateSprite").onclick = (event) => {
    projects.setToFolderSelectionMode([], (row) => {
        // Reset projects selection view, put tree back in place, and hide selection view
        projects.unsetFromFolderSelectionMode();
        document.getElementById("divProjectsLayoutPanel").appendChild(projects.projects[0].div);
        document.getElementById("modelAddToFolder").click();

        // Show the input dialog and set/use it
        document.getElementById("modalInput").click();
        window.inputDialog("New sprite file name:", "MySprite.spr", (value) => {
            if(projects.projects[0].doesPathExist(row.filePath + "/" + value) == false){
                row.addChild(value, false, true, true);
            }else{
                window.showError("File already exists, did not create it");
            }
        });
    });

    // Move the projects file tree to this selection window
    let divModelAddToFolderView = document.getElementById("divModelAddToFolderView");
    divModelAddToFolderView.appendChild(projects.projects[0].div);

    // Simply put the projects tree back in its place on exit
    document.getElementById("divModelAddToFolderExit").onclick = (event) => {
        projects.unsetFromFolderSelectionMode();
        document.getElementById("divProjectsLayoutPanel").appendChild(projects.projects[0].div);
    }
    
    // let close = window.folderSelectionShow("Use the \"Projects\" panel on the left to choose a folder for the new sprite file", () => {
    //     projects.unsetFromFolderSelectionMode();
    // });

    // projects.setToFolderSelectionMode([], (row) => {
    //     projects.unsetFromFolderSelectionMode();
    //     close();

    //     window.inputDialog("Enter a new name for the sprite file", "MySprite.spr", (value) => {
    //         if(projects.projects[0].doesPathExist(row.filePath + "/" + value) == false){
    //             row.addChild(value, false, true, true);
    //         }else{
    //             window.showError("File already exists, did not create it");
    //         }
    //     });
    // });
}