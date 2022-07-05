import { Layout } from "../../../modules/layout/layout.js";
import { Console } from "../../../modules/console/console.js";
import { WorkspaceSelection } from "../../../modules/workspace-selection/workspace-selection.js";
import { Projects } from "../../../modules/projects/projects.js";
import { SpriteEditor } from "../../../modules/sprite-editor/sprite-editor.js";
import { CodeEditor } from "../../../modules/code-editor/code-editor.js";
import { Serial } from "../../../modules/serial/serial.js";
import { Repl } from "../../../modules/repl/repl.js";


let divLayout = document.getElementById("divLayout");

let layout = new Layout(divLayout);
let consoleWorkspace = new WorkspaceSelection([["btnThumbyConsole", ["divThumbyConsole", "divRunOnThumby"]], ["btnBrowserConsole", ["divBrowserConsole", "divRunInBrowser"]]]);


let codeEditor = new CodeEditor("divCodeEditor");

let projects = new Projects("divProjects", codeEditor);

let spriteEditor = new SpriteEditor();
let mainWorkspace = new WorkspaceSelection([["btnCode", ["divCode"]], 
                                            ["btnSprite", ["divSprite"], () => {spriteEditor.shown = true;}, () => {spriteEditor.shown = false;}],
                                            ["btnMusic", ["divMusic"]]]);


let thumbyConsole = new Console(document.getElementById("divThumbyConsole"), "Thumby console\r\n");
let browserConsole = new Console(document.getElementById("divBrowserConsole"), "Browser console\r\n");


// For some reason, Mac OS makes the PID show up as 10 for Thumby, sometimes
let repl = new Repl();
let serial = new Serial([{usbVendorId: 11914, usbProductId: 5}, {usbVendorId:11914, usbProductId: 10}]);

// When serial is connected and gets data from a device, filter it through REPL first before outputting to the console
serial.onData = (data) => {
    repl.consumeData(data);
}

// When serial connects, allow repl to go through connection procedure
serial.onConnect = () => {
    repl.connected();
}

// REPL module filtered the incoming serial data, output to console
repl.onOutput = (data) => {
    thumbyConsole.write(data);
}

repl.onWrite = (data) => {
    serial.write(data);
}


thumbyConsole.onType = (data) => {
    serial.write(data);
}


// When a new project is to be added, open a new project with
document.getElementById("btnNewProject").onclick = (event) => {
    projects.addProject("TEST");
}


document.getElementById("btnResetLayout").onclick = (event) => {
    layout.resetLayoutSize();
    spriteEditor.resetLayoutSize();
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


document.getElementById("btnRunOnThumby").onclick = async (event) => {
    if(!serial.connected){
        await serial.connect();
    }
}




let savingMethod = {method: undefined, module: undefined};


let saveCurrentProject = async () => {
    let project = projects.projects[0];

    if(savingMethod.module == undefined){
        if(savingMethod.method == "PC"){
            savingMethod.module = await window.showDirectoryPicker({mode: "readwrite"});
            project.save(savingMethod.module);
        }else if(savingMethod.method == "Thumby"){
            savingMethod.module = repl;
        }
    }
}


document.addEventListener("keydown", (event) => {
    if(event.code == "KeyS" && event.ctrlKey){
        event.preventDefault();
        if(savingMethod.method == undefined){
            window.showSaveToDialog(savingMethod, saveCurrentProject);
        }else{
            console.log("Save to " + savingMethod.method);
            saveCurrentProject();
        }
    }
});


document.getElementById("btnSaveProjectTo").onclick = (event) => {
    window.showSaveToDialog(savingMethod, saveCurrentProject);
}