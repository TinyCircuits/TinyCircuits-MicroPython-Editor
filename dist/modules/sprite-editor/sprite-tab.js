class SpriteTab{
    constructor(divSpriteTabHeader, filePath, tabData, tabClosedCallback = (filePath) => {}, tabUnselectAll = () => {}){
        this.divSpriteTabHeader = divSpriteTabHeader;
        this.filePath = filePath;
        this.name = filePath.slice(filePath.lastIndexOf("/")+1);
        this.tabData = tabData;

        this.tabClosedCallback = tabClosedCallback;
        this.tabUnselectAll = tabUnselectAll;

        this.#initTab();

        this.onClose = () => {};
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
            this.onClose();
            this.divSpriteTabHeader.removeChild(this.divTab);

            this.tabClosedCallback(this.filePath);
        }
    }


    select(){
        this.tabUnselectAll();

        this.divTab.classList = "select-none flex items-center justify-evenly min-w-[48px] min-h-[40px] px-4 mx-2 rounded-full  bg-white hover:bg-white text-black border-black active:bg-black active:text-white  dark:bg-white dark:hover:bg-black dark:text-black dark:hover:text-white dark:border-white dark:active:bg-white dark:active:text-black  border duration-200";
    
        this.selected = true;
    }


    unselect(){
        this.divTab.classList = "select-none flex items-center justify-evenly min-w-[48px] min-h-[40px] px-4 mx-2 rounded-full bg-black hover:bg-white text-white hover:text-black border-black active:bg-black active:text-white  dark:bg-white dark:hover:bg-black dark:text-black dark:hover:text-white dark:border-white dark:active:bg-white dark:active:text-black  border duration-200";
    
        this.selected = false;
    }


    changeFilePath(path){

    }
}

export { SpriteTab }