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
            document.getElementById(lastEnabledTool).classList.add("border");
            document.getElementById(lastEnabledTool).classList.add("border-primary-focus");
        }else{
            document.getElementById("btnSpriteEditorBrushTool").classList.replace("btn-primary", "btn-primary-focus");
            document.getElementById("btnSpriteEditorBrushTool").classList.add("border");
            document.getElementById("btnSpriteEditorBrushTool").classList.add("border-primary-focus");
        }
        if(lastEnabledColor != null){
            document.getElementById(lastEnabledColor).classList.replace("btn-primary", "btn-primary-focus");
            document.getElementById(lastEnabledColor).classList.add("border");
            document.getElementById(lastEnabledColor).classList.add("border-primary-focus");
        }else{
            document.getElementById("btnSpriteEditorWhite").classList.replace("btn-primary", "btn-primary-focus");
            document.getElementById("btnSpriteEditorWhite").classList.add("border");
            document.getElementById("btnSpriteEditorWhite").classList.add("border-primary-focus");
        }

        // Track, save, and restore the filled checkbox state here
        let filled = localStorage.getItem("SpriteEditorFilled");
        if(filled != null && filled == "false"){
            document.getElementById("checkboxSpriteEditorFilled").checked = false;
        }
        document.getElementById("checkboxSpriteEditorFilled").onclick = (event) => {
            localStorage.setItem("SpriteEditorFilled", event.currentTarget.checked);
        }


        this.btnSpriteEditorBrushTool = document.getElementById("btnSpriteEditorBrushTool");
        this.btnSpriteEditorRectangle = document.getElementById("btnSpriteEditorRectangle");
        this.btnSpriteEditorOval = document.getElementById("btnSpriteEditorOval");
        this.btnSpriteEditorLine = document.getElementById("btnSpriteEditorLine");
        this.btnSpriteEditorBucket = document.getElementById("btnSpriteEditorBucket");
        this.btnSpriteEditorBlack = document.getElementById("btnSpriteEditorBlack");
        this.btnSpriteEditorWhite = document.getElementById("btnSpriteEditorWhite");
        

        this.btnSpriteEditorBrushTool.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorRectangle.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorOval.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorLine.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorBucket.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorBlack.addEventListener("click", this.#updateColorStates.bind(this));
        this.btnSpriteEditorWhite.addEventListener("click", this.#updateColorStates.bind(this));
    }


    #toolFocusReplace(element){
        element.classList.replace("btn-primary-focus", "btn-primary");
        element.classList.remove("border");
        element.classList.remove("border-primary-focus");
    }

    #toolFocusToggle(element){
        element.classList.toggle("btn-primary-focus");
        element.classList.toggle("btn-primary");
        element.classList.toggle("border");
        element.classList.toggle("border-primary-focus");
    }

    // Keep track of which tool is toggle for this drawing canvas in relation to global element button presses
    #updateToolState(event){
        this.#toolFocusReplace(this.btnSpriteEditorBrushTool);
        this.#toolFocusReplace(this.btnSpriteEditorRectangle);
        this.#toolFocusReplace(this.btnSpriteEditorOval);
        this.#toolFocusReplace(this.btnSpriteEditorLine);
        this.#toolFocusReplace(this.btnSpriteEditorBucket);

        if(event.currentTarget.id == "btnSpriteEditorBrushTool"){
            this.#toolFocusToggle(this.btnSpriteEditorBrushTool);
            if(this.btnSpriteEditorBrushTool.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorBrushTool");
        }else if(event.currentTarget.id == "btnSpriteEditorRectangle"){
            this.#toolFocusToggle(this.btnSpriteEditorRectangle);
            if(this.btnSpriteEditorRectangle.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorRectangle");
        }else if(event.currentTarget.id == "btnSpriteEditorOval"){
            this.#toolFocusToggle(this.btnSpriteEditorOval);
            if(this.btnSpriteEditorOval.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorOval");
        }else if(event.currentTarget.id == "btnSpriteEditorLine"){
            this.#toolFocusToggle(this.btnSpriteEditorLine);
            if(this.btnSpriteEditorLine.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorLine");
        }else if(event.currentTarget.id == "btnSpriteEditorBucket"){
            this.#toolFocusToggle(this.btnSpriteEditorBucket);
            if(this.btnSpriteEditorBucket.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorBucket");
        }
    }

    #updateColorStates(event){
        this.#toolFocusReplace(this.btnSpriteEditorBlack);
        this.#toolFocusReplace(this.btnSpriteEditorWhite);

        if(event.currentTarget.id == "btnSpriteEditorBlack"){
            this.#toolFocusToggle(this.btnSpriteEditorBlack);
            if(this.btnSpriteEditorBlack.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledColor", "btnSpriteEditorBlack");
        }else if(event.currentTarget.id == "btnSpriteEditorWhite"){
            this.#toolFocusToggle(this.btnSpriteEditorWhite);
            if(this.btnSpriteEditorWhite.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledColor", "btnSpriteEditorWhite");
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