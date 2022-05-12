import { Layout } from "../../../modules/layout/layout.js";
import { Editor } from "../../../modules/editor/js/editor.js";
import { Console } from "../../../modules/console/console.js";
import { SpriteList } from "../../../modules/sprite-list/sprite-list.js";



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




let DivLayout = document.getElementById("DivLayout")
let DivWorkspace = document.getElementById("DivWorkspace");
let DivRunInBrowserConsole = document.getElementById("DivRunInBrowserConsole");
let DivRunOnThumbyConsole = document.getElementById("DivRunOnThumbyConsole");
let DivSpriteList = document.getElementById("DivSpriteList");


let layout = new Layout(DivLayout);

let editor = new Editor(DivWorkspace);

let spriteList = new SpriteList(DivSpriteList);

let runInBrowserConsole = new Console(DivRunInBrowserConsole);
let runOnThumbyConsole = new Console(DivRunOnThumbyConsole);

runInBrowserConsole.write("Browser console\r\n");
runOnThumbyConsole.write("Thumby console\r\n");


let BtnResetLayout = document.getElementById("BtnResetLayout");
BtnResetLayout.onclick = (event) => {
    layout.resetLayoutSize();
}