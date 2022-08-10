// Manages tabs and opening or saving files

import { SpriteTab } from "./sprite-tab.js";
import { SpriteAnimationPreview } from "./sprite-animation-preview.js";

class SpriteEditorManager{
    constructor(){
        this.divSpriteTabHeader = document.getElementById("divSpriteTabHeader");
        this.spriteAnimationPreview = new SpriteAnimationPreview();

        this.tabs = [];

        // Restore last clicked tool and color (set in sprite-tab-canvas.js), otherwise choose a default
        let lastEnabledTool = localStorage.getItem("SpriteEditorLastEnabledTool");
        let lastEnabledColor = localStorage.getItem("SpriteEditorLastEnabledColor");
        if(lastEnabledTool != null){
            document.getElementById(lastEnabledTool).classList.replace("btn-primary", "btn-primary-focus");
        }else{
            document.getElementById("btnSpriteEditorBrushTool").classList.replace("btn-primary", "btn-primary-focus");
        }
        if(lastEnabledColor != null){
            document.getElementById(lastEnabledColor).classList.replace("btn-primary", "btn-primary-focus");
        }else{
            document.getElementById("btnSpriteEditorWhite").classList.replace("btn-primary", "btn-primary-focus");
        }

        // Track, save, and restore the filled checkbox state here
        let filled = localStorage.getItem("SpriteEditorFilled");
        if(filled != null && filled == "false"){
            document.getElementById("checkboxSpriteEditorFilled").checked = false;
        }
        document.getElementById("checkboxSpriteEditorFilled").onclick = (event) => {
            localStorage.setItem("SpriteEditorFilled", event.currentTarget.checked);
        }
    }


    // Re-sorts tabs from left to right by tabIndex
    #sortTabs(){
        this.tabs = this.tabs.sort((a, b) => {
            return a.tabIndex - b.tabIndex;
        })
        for(let itx=0; itx<this.tabs.length; itx++){
            this.divSpriteTabHeader.insertBefore(this.tabs[itx].divTab, this.divSpriteTabHeader.lastElementChild)
        }
    }


    // When a tab is closed it will call this as a callback, remove tab from list with passed filePath, and select next best
    #tabClosed(filePath){
        for(let itx=0; itx<this.tabs.length; itx++){
            if(filePath == this.tabs[itx].filePath){
                this.tabs.remove(itx);
                break;
            }
        }
    }


    // Goes through all tabs and unselects them (typically called by a tab when it is selected)
    #unselectAll(){
        for(let itx=0; itx<this.tabs.length; itx++){
            this.tabs[itx].unselect();
        }
    }


    addTab(filePath, tabData, saveCallback){
        // Check that no tabs with this filePath already exist
        for(let itx=0; itx<this.tabs.length; itx++){
            if(filePath == this.tabs[itx].filePath){
                window.showError("File " + filePath + " already open, did not open");
                return undefined;
            }
        }

        let tabIndex = 0;
        if(this.tabs.length > 0){
            tabIndex = this.tabs[this.tabs.length-1].tabIndex+1;
        }

        // Didn't find that it was already open, 
        let newTab = new SpriteTab(divSpriteTabHeader, filePath, tabData, tabIndex, this.#tabClosed.bind(this), this.#unselectAll.bind(this), saveCallback, this.spriteAnimationPreview);
        this.tabs.push(newTab);

        this.#sortTabs();

        return newTab;
    }


    resetLayoutSize(){

    }
}

export { SpriteEditorManager };