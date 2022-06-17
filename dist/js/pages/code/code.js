import { Layout } from "../../../modules/layout/layout.js";
import { Console } from "../../../modules/console/console.js";
import { WorkspaceSelection } from "../../../modules/workspace-selection/workspace-selection.js";
import { Projects } from "../../../modules/projects/projects.js";
import { SpriteEditor } from "../../../modules/sprite-editor/sprite-editor.js";
import { CodeEditor } from "../../../modules/code-editor/code-editor.js";


// Shows popup on page with error for user to interpret, must be defined at top
// 'stack' should be a new Error().stack for reference if needed
window.showError = (errorText) => {
    console.trace(errorText);
}


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


// When a new project is to be added, open a new project with
document.getElementById("btnNewProject").onclick = (event) => {
    projects.addProject("TEST");
}


document.getElementById("btnResetLayout").onclick = (event) => {
    layout.resetLayoutSize();
    spriteEditor.resetLayoutSize();
}