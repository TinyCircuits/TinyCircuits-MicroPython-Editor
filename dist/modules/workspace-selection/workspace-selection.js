class WorkspaceSelection{
    constructor(btnDivNameListList){
        // List of dicts where each indcies dict has a key corresponding btn id and value for div id
        this.btnDivNameListList = btnDivNameListList;

        // Each index in the list is a list with index 0 being the btn HTML object and index 1 being the div HTML object
        this.entryDictList = [];

        this.localStorageKey = "";

        for (let idx=0; idx<this.btnDivNameListList.length; idx++) {
            let btnID = this.btnDivNameListList[idx][0];
            let divID = this.btnDivNameListList[idx][1];
            this.localStorageKey += btnID + divID;
            let entry = [document.getElementById(btnID), document.getElementById(divID), idx];

            // On btn click
            entry[0].onclick = (event) => {
                // Remove style edits to btns and hide all divs
                for(let iex=0; iex<this.entryDictList.length; iex++){
                    this.entryDictList[iex][0].style.backgroundColor = null;
                    this.entryDictList[iex][0].style.fill = null;
                    this.entryDictList[iex][0].style.color = null;

                    this.entryDictList[iex][1].classList.add("invisible");
                    this.entryDictList[iex][1].style.zIndex = null;
                }

                // Add style edits and show this div
                entry[0].style.backgroundColor = "white";
                entry[0].style.fill = "black";
                entry[0].style.color = "black";

                entry[1].classList.remove("invisible");
                entry[1].style.zIndex = 10;

                localStorage.setItem(this.localStorageKey + "lastClickedBtnID", event.currentTarget.id);
            }

            this.entryDictList.push(entry);
        }

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