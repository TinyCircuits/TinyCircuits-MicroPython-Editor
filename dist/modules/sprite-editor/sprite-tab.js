import { SpriteTabCanvas } from "./sprite-tab-canvas.js";

class SpriteTab{
    constructor(divSpriteTabHeader, filePath, spriteData, tabIndex, tabClosedCallback = (filePath) => {}, tabUnselectAll = () => {}, saveCallback, spriteAnimationPreview){
        this.divSpriteTabHeader = divSpriteTabHeader;
        this.filePath = filePath;
        this.name = filePath.slice(filePath.lastIndexOf("/")+1);
        this.spriteData = spriteData;

        this.onClose = () => {};

        this.spriteTabCanvas = new SpriteTabCanvas(this.filePath, spriteData, "divSpriteEditor", "divSpriteFrameList", saveCallback, spriteAnimationPreview);

        this.selected = false;

        this.tabClosedCallback = tabClosedCallback;
        this.tabUnselectAll = tabUnselectAll;

        this.#initTab();

        this.#restoreFromTabData();

        if(this.tabIndex == undefined || this.tabIndex == null){
            this.tabIndex = tabIndex;
            this.#saveTabData();
        }
    }


    #saveTabData(){
        localStorage.setItem("spriteTabData" + this.filePath, JSON.stringify({
            selected: this.selected,
            tabIndex: this.tabIndex
        }));
    }

    #restoreFromTabData(){
        // Each tab has a unique ID that's the filepath, store persistent data like last selected tab under that
        let tabData = JSON.parse(localStorage.getItem("spriteTabData" + this.filePath));
        
        if(tabData != null){
            this.tabIndex = tabData["tabIndex"];
            if(tabData["selected"] == true){
                this.select();
            }else{
                this.unselect();
            }
        }else{
            this.unselect();
        }
    }


    #initTab(){
        this.divTab = document.createElement("div");
        this.divTab.classList = "btn btn-primary cursor-default normal-case flex items-center justify-evenly min-w-[48px] min-h-0 h-[40px] pl-4 pr-2 mx-2";
        this.divTab.title = this.filePath;

        this.divSpriteTabHeader.insertBefore(this.divTab, this.divSpriteTabHeader.lastElementChild);
        
        // this.divSpriteTabHeader.appendChild(this.divTab);

        this.#initTabText();
        this.#initTabCloseBtn();

        this.divTab.onclick = (event) => {
            this.select();
        }
    }


    #initTabText(){
        this.divTabText = document.createElement("div");
        this.divTabText.classList = "w-fit h-fit";
        this.divTabText.textContent = this.name;

        this.divTab.appendChild(this.divTabText);
    }


    #initTabCloseBtn(){
        this.btnClose = document.createElement("button");
        this.btnClose.classList = "btn btn-primary btn-sm min-h-0 p-0 w-[15px] h-[15px] ml-1 bg-transparent border-0";
        this.btnClose.innerHTML =
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        `;

        this.divTab.appendChild(this.btnClose);

        this.btnClose.onclick = (event) => {
            this.close();
        }
    }


    select(){
        this.tabUnselectAll();

        this.divTab.classList.remove("btn-primary");
        this.divTab.classList.add("btn-primary-focus");
        this.selected = true;
        this.#saveTabData();

        this.spriteTabCanvas.show();
    }


    unselect(){
        this.divTab.classList.add("btn-primary");
        this.divTab.classList.remove("btn-primary-focus");
        this.selected = false;
        this.#saveTabData();

        this.spriteTabCanvas.hide();
    }


    changeFilePath(filePath){
        // Change local storage key
        localStorage.setItem("spriteTabData" + filePath, localStorage.getItem("spriteTabData" + this.filePath));
        localStorage.removeItem("spriteTabData" + this.filePath);

        this.filePath = filePath;
        this.divTab.title = this.filePath;
        this.divTabText.textContent = this.filePath.slice(this.filePath.lastIndexOf("/")+1);

        this.spriteTabCanvas.changeFilePath(filePath);

        this.#saveTabData();
    }


    close(){
        // Only actually close in the header and therefore not closed
        if(this.divSpriteTabHeader.contains(this.divTab)){
            this.onClose();
            this.divSpriteTabHeader.removeChild(this.divTab);

            // Make sure to save an undefined value so it won't resume position from saved
            this.tabIndex = undefined;
            this.#saveTabData();

            // Close the underlying canvas class object
            this.spriteTabCanvas.close();

            this.tabClosedCallback(this.filePath);
        }
    }
}

export { SpriteTab }