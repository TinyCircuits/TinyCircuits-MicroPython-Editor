import { Layout } from "../../../modules/layout/layout.js";
import { Editor } from "../../../modules/editor/js/editor.js";
import { Console } from "../../../modules/console/console.js";
import { WorkspaceSelection } from "../../../modules/workspace-selection/workspace-selection.js";
import { Projects } from "../../../modules/projects/projects.js";
import { SpriteEditor } from "../../../modules/sprite-editor/sprite-editor.js";


// Shows popup on page with error for user to interpret, must be defined at top
// 'stack' should be a new Error().stack for reference if needed
window.showError = (errorText) => {
    console.trace(errorText);
}


let divLayout = document.getElementById("divLayout");
let divCode = document.getElementById("divCode");
let divProjects = document.getElementById("divProjects");

let layout = new Layout(divLayout);
let consoleWorkspace = new WorkspaceSelection([["btnThumbyConsole", ["divThumbyConsole", "divRunOnThumby"]], ["btnBrowserConsole", ["divBrowserConsole", "divRunInBrowser"]]]);
// let editor = new Editor(divCode);
let projects = new Projects(divProjects);
let spriteEditor = new SpriteEditor();
let mainWorkspace = new WorkspaceSelection([["btnCode", ["divCode"]], 
                                            ["btnSprite", ["divSprite"], () => {spriteEditor.shown = true;}, () => {spriteEditor.shown = false;}],
                                            ["btnMusic", ["divMusic"]]]);


let thumbyConsole = new Console(document.getElementById("divThumbyConsole"), "Thumby console\r\n");
let browserConsole = new Console(document.getElementById("divBrowserConsole"), "Browser console\r\n");


// projects.addProject("1");
// projects.addProject("2");
// projects.addProject("3");
// projects.closeProject("2");


document.getElementById("btnResetLayout").onclick = (event) => {
    layout.resetLayoutSize();
    spriteEditor.resetLayoutSize();
}