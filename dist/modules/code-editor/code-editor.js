class Tab{
    constructor(tabManager, tabHeaderDiv, divCodeEditorParent, filePath, data, tabIndex){
        this.tabManager = tabManager;
        this.tabHeaderDiv = tabHeaderDiv;
        this.divCodeEditorParent = divCodeEditorParent;
        this.filePath = filePath;

        this.selected = false;

        // console.log("File data at tab:", data);

        // Overridable functions for external modules to use (projects, project, row)
        this.onSave = (data) => {};
        this.onClose = () => {};

        this.#addTabHTML();
        this.#initEditor(data);
        
        this.#restoreFromTabData();

        if(this.tabIndex == undefined || this.tabIndex == null){
            this.tabIndex = tabIndex;
            this.#saveTabData();
        }
    }


    #saveTabData(){
        localStorage.setItem("tabData" + this.filePath, JSON.stringify({
            selected: this.selected,
            tabIndex: this.tabIndex
        }));
    }


    #restoreFromTabData(){
        // Each tab has a unique ID that's the filepath, store persistent data like last selected tab under that
        let tabData = JSON.parse(localStorage.getItem("tabData" + this.filePath));
        
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


    close(){
        // Only close when actually in the tab header and not already closed
        if(this.tabHeaderDiv.contains(this.divTab)){
            // Remove self from tabs list
            for(let itx=0; itx<this.tabManager.tabs.length; itx++){
                if(this.tabManager.tabs[itx].filePath == this.filePath){
                    this.tabManager.tabs.remove(itx);

                    // If this tab is selected, select the next best tab since this one is closing
                    if(this.selected){
                        if(this.tabManager.tabs.length > 0){
                            if(itx == this.tabManager.tabs.length){
                                this.tabManager.tabs[itx-1].select();
                            }else{
                                this.tabManager.tabs[itx].select();
                            }
                        }
                    }
                    break;
                }
            }

            // Destroy ace editor and remove tab HTML
            this.editor.destroy();
            this.tabHeaderDiv.removeChild(this.divTab);
            this.divCodeEditorParent.removeChild(this.divEditor);

            // Call the callback for when a tab closes
            this.onClose();

            // Make sure to save an undefined value so it won't resume position from saved
            this.tabIndex = undefined;
            this.#saveTabData();
        }
    }


    select(){
        for(let itx=0; itx<this.tabManager.tabs.length; itx++){
            this.tabManager.tabs[itx].unselect();
        }
        this.divTab.classList = "select-none w-fit h-[23px] ml-[-1px] mt-[-1px] border border-x-black px-1 flex flex-row justify-center items-center";
        this.btnCloseTab.classList = "w-[15px] h-[15px] fill-stone-400 active:fill-white duration-100";
        this.divEditor.classList.remove("invisible");

        this.selected = true;

        this.#saveTabData();
    }

    
    unselect(){
        this.divTab.classList = "select-none w-fit h-[23px] ml-[-1px] mt-[-1px] border border-black px-1 flex flex-row justify-center items-center bg-black hover:bg-white text-white hover:text-black active:bg-black active:text-white duration-200";
        this.btnCloseTab.classList = "w-[15px] h-[15px] fill-stone-400 active:fill-black duration-100";
        this.divEditor.classList.add("invisible");

        this.selected = false;

        this.#saveTabData();
    }


    // Changing the file path changes the name shown in the tab (used by project rows on rename)
    changeFilePath(filePath){
        localStorage.removeItem("tabData" + this.filePath);

        this.filePath = filePath;
        this.divTab.title = this.filePath;
        this.divText.innerText = this.filePath.slice(this.filePath.lastIndexOf("/")+1);

        this.#saveTabData();
    }
    

    #addTabHTML(){
        // The actual overall tab div
        this.divTab = document.createElement("div");
        this.divTab.title = this.filePath;
        this.divTab.classList = "select-none w-fit h-[23px] ml-[-1px] mt-[-1px] border border-x-black px-1 flex flex-row justify-center items-center";
        this.tabHeaderDiv.appendChild(this.divTab);

        this.divText = document.createElement("div");
        this.divText.classList = "w-fit h-full mr-1 mt-[-3px]";
        this.divText.innerText = this.filePath.slice(this.filePath.lastIndexOf("/")+1);
        this.divText.onclick = (event) => {
            this.select();
        }
        this.divTab.appendChild(this.divText);

        this.btnCloseTab = document.createElement("button");
        this.btnCloseTab.classList = "w-[15px] h-[15px] fill-black active:fill-white duration-100";
        this.btnCloseTab.innerHTML =
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full fill-inherit stroke-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        `;
        this.btnCloseTab.onclick = (event) => {
            this.close();
        }

        this.divTab.appendChild(this.btnCloseTab);
    }


    #initEditor(data){
        this.divEditor = document.createElement("div");
        this.divEditor.classList = "absolute left-0 right-0 bottom-0 top-0 flex";
        this.divCodeEditorParent.appendChild(this.divEditor);

        this.editor = ace.edit(this.divEditor);
        this.editor.setTheme("ace/theme/chrome");
        this.editor.session.setMode("ace/mode/python");

        if(data != undefined){
            this.editor.setValue(data, 1);
        }

        this.editor.session.on('change', (event) => {
            this.onSave(this.editor.getValue());
        });

        this.editor.resize();
    }
}


class TabManager{
    constructor(parentDiv){
        this.parentDiv = parentDiv;

        // Setup the header for tabs to live in
        this.tabHeaderDiv = document.createElement("div");
        this.tabHeaderDiv.classList = "w-full h-6 border border-b-black flex";
        this.parentDiv.appendChild(this.tabHeaderDiv);

        // Set the space where each div for each code editor is placed on top of each other
        this.divCodeEditorParent = document.createElement("div");
        this.divCodeEditorParent.classList = "absolute left-0 right-0 top-6 bottom-0";
        this.parentDiv.appendChild(this.divCodeEditorParent);

        // List of tabs
        this.tabs = [];
    }


    // Re-sorts tabs from left to right by tabIndex
    sortTabs(){
        this.tabs = this.tabs.sort((a, b) => {
            return a.tabIndex - b.tabIndex;
        })
        for(let itx=0; itx<this.tabs.length; itx++){
            this.tabHeaderDiv.appendChild(this.tabs[itx].divTab);
        }
    }


    addTab(filePath, data){
        for(let itx=0; itx<this.tabs.length; itx++){
            if(this.tabs[itx].filePath == filePath){
                window.showError("Tab with file path '" + filePath + "' already exists, did not open");
                return undefined;
            }
        }

        let tabIndex = 0;
        if(this.tabs.length > 0){
            tabIndex = this.tabs[this.tabs.length-1].tabIndex+1;
        }

        let newTab = new Tab(this, this.tabHeaderDiv, this.divCodeEditorParent, filePath, data, tabIndex);
        this.tabs.push(newTab);

        this.sortTabs();

        return newTab;
    }
}


class CodeEditor{
    constructor(divID){
        this.divCodeEditor = document.getElementById(divID);

        this.tabManager = new TabManager(this.divCodeEditor);
    }

    openFile(filePath, data, tabIndex){
        return this.tabManager.addTab(filePath, data, tabIndex);
    }
}

export { CodeEditor }