import { SpriteTabCanvas } from "./sprite-tab-canvas.js";

class SpriteTab{
    constructor(divSpriteTabHeader, filePath, spriteData, tabIndex, tabClosedCallback = (filePath) => {}, tabUnselectAll = () => {}){
        // Tab data is a file in the following format (per-byte) (otherwise activate importer/converter legacy tool if start string not found)
        // TINYCIRCUITS_SPRITE_FORMAT_V001                       (31 bytes)
        // FRAME_COUNT_BYTE FRAME_WIDTH_BYTE FRAME_HEIGHT_BYTE   (3 bytes)
        // VLSB_DATA ...                                         (FRAME_COUNT * FRAME_WIDTH * FRAME_HEIGHT // 8 bytes)

        this.divSpriteTabHeader = divSpriteTabHeader;
        this.filePath = filePath;
        this.name = filePath.slice(filePath.lastIndexOf("/")+1);
        this.spriteData = spriteData;
        this.spriteTabCanvas = new SpriteTabCanvas(this.filePath, "divSpriteEditor", "divSpriteFrameList");

        this.selected = false;

        this.tabClosedCallback = tabClosedCallback;
        this.tabUnselectAll = tabUnselectAll;

        this.#initTab();

        this.onClose = () => {};

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
        this.divTab.classList = "select-none flex items-center justify-evenly min-w-[48px] min-h-[40px] px-4 mx-2 rounded-full bg-black hover:bg-white text-white hover:text-black border-black active:bg-black active:text-white  dark:bg-white dark:hover:bg-black dark:text-black dark:hover:text-white dark:border-white dark:active:bg-white dark:active:text-black  border duration-200";
        this.divTab.title = this.filePath;

        this.divSpriteTabHeader.appendChild(this.divTab);

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
        this.btnClose.classList = "w-[15px] h-[15px] fill-slate-400 hover:fill-slate-200 duration-100 ml-1";
        this.btnClose.innerHTML =
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full fill-inherit stroke-1" viewBox="0 0 20 20" fill="currentColor">
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

        this.divTab.classList = "select-none flex items-center justify-evenly min-w-[48px] min-h-[40px] px-4 mx-2 rounded-full  bg-white hover:bg-white text-black border-black active:bg-black active:text-white  dark:bg-white dark:hover:bg-black dark:text-black dark:hover:text-white dark:border-white dark:active:bg-white dark:active:text-black  border duration-200";
    
        this.selected = true;
        this.#saveTabData();

        this.spriteTabCanvas.show();
    }


    unselect(){
        this.divTab.classList = "select-none flex items-center justify-evenly min-w-[48px] min-h-[40px] px-4 mx-2 rounded-full bg-black hover:bg-white text-white hover:text-black border-black active:bg-black active:text-white  dark:bg-white dark:hover:bg-black dark:text-black dark:hover:text-white dark:border-white dark:active:bg-white dark:active:text-black  border duration-200";
    
        this.selected = false;
        this.#saveTabData();

        this.spriteTabCanvas.hide();
    }


    changeFilePath(filePath){
        localStorage.removeItem("spriteTabData" + this.filePath);

        this.filePath = filePath;
        this.divTab.title = this.filePath;
        this.divTabText.textContent = this.filePath.slice(this.filePath.lastIndexOf("/")+1);

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

            this.tabClosedCallback(this.filePath);
        }
    }
}

export { SpriteTab }