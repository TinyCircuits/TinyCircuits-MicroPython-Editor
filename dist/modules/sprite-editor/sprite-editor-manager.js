// Manages tabs and opening or saving files

import { SpriteTab } from "./sprite-tab.js";

class SpriteEditorManager{
    constructor(){
        this.divSpriteTabHeader = document.getElementById("divSpriteTabHeader");

        this.tabs = [];
    }


    // When a tab is closed it will call this as a callback, remove tab from list with passed filePath
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


    addTab(filePath, tabData){
        // Check that no tabs with this filePath already exist
        for(let itx=0; itx<this.tabs.length; itx++){
            if(filePath == this.tabs[itx].filePath){
                window.showError("File " + filePath + " already open, did not open");
                return undefined;
            }
        }

        // Didn't find that it was already open, 
        let newTab = new SpriteTab(divSpriteTabHeader, filePath, tabData, this.#tabClosed.bind(this), this.#unselectAll.bind(this));
        this.tabs.push(newTab);
        return newTab;
    }


    resetLayoutSize(){

    }
}

export { SpriteEditorManager };