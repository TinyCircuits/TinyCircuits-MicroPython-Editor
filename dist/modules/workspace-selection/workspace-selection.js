class WorkspaceSelection{
    constructor(btnDivNameListList){
        // List of dicts where each indcies dict has a key corresponding btn id and value for div id
        this.btnDivNameListList = btnDivNameListList;

        // Each index in the list is a list with index 0 being the btn HTML object and index 1 being the div HTML object
        this.entryDictList = [];

        // This key is needed so that this workspace selection instance can auto click the last clicked tab
        this.localStorageKey = "";

        for (let ibx=0; ibx<this.btnDivNameListList.length; ibx++) {
            let btn = document.getElementById(this.btnDivNameListList[ibx][0]);
            let shownCallback = this.btnDivNameListList[ibx][2];
            let hiddenCallback = this.btnDivNameListList[ibx][3];
            this.localStorageKey += this.btnDivNameListList[ibx][0];

            let entry = [btn, [], shownCallback, hiddenCallback];
            for(let idx=0; idx<this.btnDivNameListList[ibx][1].length; idx++){
                this.localStorageKey += this.btnDivNameListList[ibx][1][idx];
                entry[1].push(document.getElementById(this.btnDivNameListList[ibx][1][idx]));
            }

            entry[0].onclick = (event) => {
                // Remove style edits to btns and hide all divs
                for(let iex=0; iex<this.entryDictList.length; iex++){
                    // Change button style
                    if(this.entryDictList[iex][0].classList.contains("btn-primary-focus")){
                        this.entryDictList[iex][0].classList.add("btn-primary");
                        this.entryDictList[iex][0].classList.remove("btn-primary-focus");
                        this.entryDictList[iex][0].classList.remove("border");
                        this.entryDictList[iex][0].classList.remove("border-primary-focus");
                    }else if(this.entryDictList[iex][0].classList.contains("btn-accent-focus")){
                        this.entryDictList[iex][0].classList.add("btn-accent");
                        this.entryDictList[iex][0].classList.remove("btn-accent-focus");
                    }

                    // Call the hidden callback
                    if(this.entryDictList[iex][3] != undefined){
                        this.entryDictList[iex][3]();
                    }

                    // Make all corresponding elements invisible
                    for(let idx=0; idx<this.btnDivNameListList[ibx][1].length; idx++){
                        // Change opacity as well to see change right away
                        this.entryDictList[iex][1][idx].style.opacity = 0;
                        this.entryDictList[iex][1][idx].classList.add("invisible");
                        this.entryDictList[iex][1][idx].style.zIndex = null;
                    }
                }

                // Change button style to selected
                if(entry[0].classList.contains("btn-primary")){
                    entry[0].classList.remove("btn-primary");
                    entry[0].classList.add("btn-primary-focus");
                    entry[0].classList.add("border");
                    entry[0].classList.add("border-primary-focus");
                }else if(entry[0].classList.contains("btn-accent")){
                    entry[0].classList.remove("btn-accent");
                    entry[0].classList.add("btn-accent-focus");
                }
                

                // Go through list of elements that correspond to selection and make them not invisible (nothing to do with buttons)
                for(let idx=0; idx<this.btnDivNameListList[ibx][1].length; idx++){
                    entry[1][idx].style.opacity = 100;
                    entry[1][idx].classList.remove("invisible");
                    entry[1][idx].style.zIndex = 10;
                }

                // Call the shown callback
                if(entry[2] != undefined){
                    entry[2]();
                }

                localStorage.setItem(this.localStorageKey + "lastClickedBtnID", event.currentTarget.id);
            }

            this.entryDictList.push(entry);
        }


        // Auto click the last button clicked by the user on instance instantiation
        let lastClickedBtnID = localStorage.getItem(this.localStorageKey + "lastClickedBtnID");
        if(lastClickedBtnID == null || lastClickedBtnID == ""){
            // By default, click the first btn in the index to show that div
            this.entryDictList[0][0].click();
        }else{
            document.getElementById(lastClickedBtnID).click();
        }
    }
}

export { WorkspaceSelection };