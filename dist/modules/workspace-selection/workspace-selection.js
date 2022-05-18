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
            this.localStorageKey += this.btnDivNameListList[ibx][0];

            let entry = [btn, []];
            for(let idx=0; idx<this.btnDivNameListList[ibx][1].length; idx++){
                this.localStorageKey += this.btnDivNameListList[ibx][1][idx];
                entry[1].push(document.getElementById(this.btnDivNameListList[ibx][1][idx]));
            }

            entry[0].onclick = (event) => {
                // Remove style edits to btns and hide all divs
                for(let iex=0; iex<this.entryDictList.length; iex++){
                    this.entryDictList[iex][0].style.backgroundColor = null;
                    this.entryDictList[iex][0].style.fill = null;
                    this.entryDictList[iex][0].style.color = null;

                    for(let idx=0; idx<this.btnDivNameListList[ibx][1].length; idx++){
                        this.entryDictList[iex][1][idx].classList.add("invisible");
                        this.entryDictList[iex][1][idx].style.zIndex = null;
                    }
                }

                // Add style edits and show these divs
                entry[0].style.backgroundColor = "white";
                entry[0].style.fill = "black";
                entry[0].style.color = "black";

                for(let idx=0; idx<this.btnDivNameListList[ibx][1].length; idx++){
                    entry[1][idx].classList.remove("invisible");
                    entry[1][idx].style.zIndex = 10;
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