class Row{
    constructor(text, parent, isFolder=true){
        this.text = text;
        this.parent = parent;
        this.isFolder = isFolder;
        this.childRows = [];


        this.rowExpanderDiv = document.createElement("div");
        this.rowDiv = document.createElement("div");
        this.rowExpanderDiv.appendChild(this.rowDiv);
        if(Object.prototype.toString.call(parent).indexOf("HTMLDivElement") != -1){
            this.parentCount = 0;
            this.isRoot = true;

            this.parent.appendChild(this.rowExpanderDiv);
        }else{
            this.parentCount = this.parent.parentCount + 1;
            this.isRoot = false;

            // Div that contains the main row being added as well as room to expand as a parent
            this.rowExpanderDiv.classList = "min-w-full, min-h-fit flex flex-col";
            this.parent.rowExpanderDiv.appendChild(this.rowExpanderDiv);

            // Setup row and make sure bg changes on hover
            this.rowDiv.classList = "min-w-full h-6 bg-gray-200 cursor-pointer";
            this.rowDiv.onmouseenter = (event) => {
                this.rowDiv.classList.remove("bg-gray-200");
                this.rowDiv.classList.add("bg-gray-300");
                this.optionsDiv.classList.remove("invisible");
            }
            this.rowDiv.onmouseleave = (event) => {
                this.rowDiv.classList.remove("bg-gray-300");
                this.rowDiv.classList.add("bg-gray-200");
                this.optionsDiv.classList.add("invisible");
            }

            this.iconDiv = document.createElement("div");
            this.iconDiv.classList = "w-6 h-6 absolute left-0 mt-0.5";
            this.iconDiv.style.marginLeft = ((this.parentCount - 1) * 12) + "px";
            if(this.isFolder){
                this.useFolderIcon();
            }else{
                this.useDocumentIcon();
            }
            this.rowDiv.appendChild(this.iconDiv);

            this.optionsDiv = document.createElement("div");
            this.optionsDiv.classList = "w-6 h-6 absolute right-0 invisible mt-0.5 rounded-full hover:stroke-gray-300";
            this.optionsDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
            `;
            this.rowDiv.appendChild(this.optionsDiv);

            this.textDiv = document.createElement("div");
            this.textDiv.classList = "min-w-fit h-6 text-black absolute select-none whitespace-nowrap";
            this.textDiv.style.marginLeft = 22 + ((this.parentCount - 1) * 12) + "px";
            this.textDiv.textContent = this.text;
            this.rowDiv.appendChild(this.textDiv);
        }
    }


    useFolderIcon(outline=false){
        if(this.iconDiv != undefined){
            if(!outline){
                this.iconDiv.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    `;
            }else{
                this.iconDiv.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    `;
            }
        }
        this.isFolder = true;
    }

    useDocumentIcon(outline=false){
        if(this.iconDiv != undefined){
            if(!outline){
                this.iconDiv.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                    </svg>
                    `;
            }else{
                this.iconDiv.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    `;
            }
        }
        this.isFolder = false;
    }


    addChild(text, isFolder=true){
        let child = new Row(text, this, isFolder);
        this.childRows.push(child);
        this.useFolderIcon();
        return child;
    }
}



class Projects{
    constructor(div, indentSizePx=4){
        this.div = div;
        this.indentSizePx = indentSizePx;

        this.rootRow = new Row("", div);
        this.rootRow.addChild("My Project");
        this.rootRow.addChild("My Other Project").addChild("Folder").addChild("File2", false);

        // this.exampleTree = {
        //     "MyProject": ["File1", "File2", "File3"],
        //     "MyOtherProject": ["File4", {"InternalFolder": ["File5", "File6"]}, "File7"]
        // }

        // console.log(JSON.stringify(this.exampleTree, null, 2));
    }
}

export { Projects }