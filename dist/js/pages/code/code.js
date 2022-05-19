import { Layout } from "../../../modules/layout/layout.js";
import { Editor } from "../../../modules/editor/js/editor.js";
import { Console } from "../../../modules/console/console.js";
import { WorkspaceSelection } from "../../../modules/workspace-selection/workspace-selection.js";
import { Projects } from "../../../modules/projects/projects.js";


let divLayout = document.getElementById("divLayout");
let divCode = document.getElementById("divCode");
let divProjects = document.getElementById("divProjects");

let layout = new Layout(divLayout);
let mainWorkspace = new WorkspaceSelection([["btnCode", ["divCode"]], ["btnSprite", ["divSprite"]], ["btnMusic", ["divMusic"]]]);
let consoleWorkspace = new WorkspaceSelection([["btnThumbyConsole", ["divThumbyConsole", "divRunOnThumby"]], ["btnBrowserConsole", ["divBrowserConsole", "divRunInBrowser"]]]);
let editor = new Editor(divCode);
let projects = new Projects(divProjects)


let thumbyConsole = new Console(document.getElementById("divThumbyConsole"), "Thumby console\r\n");
let browserConsole = new Console(document.getElementById("divBrowserConsole"), "Browser console\r\n");



document.getElementById("btnResetLayout").onclick = (event) => {
    layout.resetLayoutSize();
}



// document.addEventListener("DOMContentLoaded", () => {

//     document.getElementById("main").style.width = document.getElementById("DivLayout").clientWidth + "px";
//     document.getElementById("main").style.height = document.getElementById("DivLayout").clientHeight + "px";

//     var sizes = {
//         "win1" : 0.125,
//         "win5" : 0.75,
//         "win7": 0.80
//     };

//     // Try to restore layout from localstorage
//     let savedLayoutSizes = localStorage.getItem("LayoutSizes");
//     if(savedLayoutSizes != null){
//         Resizable.initialise("main", JSON.parse(savedLayoutSizes), 2);
//     }else{
//         Resizable.initialise("main", this.defaultSizes, 2);
//     }

// });

// window.addEventListener("resize", () => {
//     Resizable.activeContentWindows[0].changeSize(document.getElementById("DivLayout").clientWidth, document.getElementById("DivLayout").clientHeight);
//     Resizable.activeContentWindows[0].childrenResize();
// });

// Resizable.windowResized = () => {
//     this.thumbyConsole.fit();
// }

// Resizable.resizingStarted = () => {

// }

// Resizable.resizingEnded = () => {
//     this.saveLayout();
// }


// let DivWorkspace = document.getElementById("DivWorkspace");
// let DivSpriteList = document.getElementById("DivSpriteList");



// let editor = new Editor(DivWorkspace);

// let spriteList = new SpriteList(DivSpriteList);