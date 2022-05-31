class Row{
    constructor(text, parent, isFolder, isOpened, project){
        // Each row gets text, parent row, flag for being a folder, and children
        this.text = text;
        this.parent = parent;
        this.isFolder = isFolder;
        this.project = project;
        this.childRows = [];

        // File contents need to have a unique key to get files from the passed project
        // and its database. Create a key for files based on its text and all its parent's
        // texts. No location should be able to contain two of the same named items
        if(!this.isRoot && !this.parent.isRoot && !this.isFolder){
            this.projectFileDatabaseKey = "ProjectFileDatabaseKey" + this.text;
            let tempParent = this.parent;
            while(tempParent.parent != undefined && !tempParent.parent.isRoot){
                this.projectFileDatabaseKey += tempParent.text;
                tempParent = tempParent.parent;
            }
        }

        // Only for use on rows that are not folders and is used to fetch
        // this rows file contents and open in external editor
        this.isOpened = isOpened;

        // Set if root or not (root is the project parent div and not the row with the project name)
        this.isRoot = undefined;

        // Row expander contains this row as well as child rows for easy setting of the background color
        this.rowExpanderDiv = document.createElement("div");

        // The actual div contained in the expander row
        this.rowDiv = document.createElement("div");
        this.rowExpanderDiv.appendChild(this.rowDiv);


        // When a row is click and it is not a folder, root, 
        // a the first child of root, open it's contents
        this.rowDiv.ondblclick = (event) => {
            if(!this.isRoot && !this.parent.isRoot && !this.isFolder){
                // Get the editor so we can watch for changes and save them
                this.isOpened = true;
                this.project.saveProject();
            }
        }


        // Depending on what was passed, use a folder or file icon
        if(this.isFolder){
            this.useFolderIcon();
        }else{
            this.useDocumentIcon();
        }


        // Root is an HTML dom element and all others are Row class objects
        if(Object.prototype.toString.call(parent).indexOf("HTMLDivElement") != -1){
            this.parentCount = 0;
            this.isRoot = true;

            this.parent.appendChild(this.rowExpanderDiv);
        }else{
            // Each time a child is added, take the parent's count and add one to keep track at any time
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

            // Icon div can be a folder or file depending on flag
            // that is set by force or by adding children to a row
            this.iconDiv = document.createElement("div");
            this.iconDiv.classList = "w-6 h-6 absolute left-0 mt-0.5";
            this.iconDiv.style.marginLeft = ((this.parentCount - 1) * 12) + "px";
            if(this.isFolder){
                this.useFolderIcon();
            }else{
                this.useDocumentIcon();
            }
            this.rowDiv.appendChild(this.iconDiv);

            // Options div is always same and exists to indicate to the user that they can click it
            this.optionsDiv = document.createElement("div");
            this.optionsDiv.classList = "w-6 h-6 absolute right-0 invisible mt-0.5 rounded-full hover:stroke-gray-300";
            this.optionsDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
            `;
            this.optionsDiv.onclick = (event) => {
                this.#showOptionsDropdown();
            }
            this.rowDiv.appendChild(this.optionsDiv);

            // Text div is the div to the right of the icon div and contains folder/file name
            this.textDiv = document.createElement("div");
            this.textDiv.classList = "min-w-fit h-6 text-black absolute select-none whitespace-nowrap";
            this.textDiv.style.marginLeft = 22 + ((this.parentCount - 1) * 12) + "px";
            this.textDiv.textContent = this.text;
            this.rowDiv.appendChild(this.textDiv);
        }
    }


    #showOptionsDropdown(){
        // Create square to cover area of clicked item
        this.divOptionsDropdownSelector = document.createElement("div");
        this.divOptionsDropdownSelector.classList = "absolute z-[100000]";

        // Create div to contain actual option buttons (defined based on if this is a folder or not or if root)
        this.divOptionsDropdown = document.createElement("div");
        this.divOptionsDropdown.classList = "w-20 h-fit bg-black absolute z-[100000] flex flex-col rounded-md";

        // Get the rect of the clicked div to cover with selector
        let optionsDivRect = this.optionsDiv.getBoundingClientRect();

        // Cover clicked div and move to same location
        this.divOptionsDropdownSelector.style.width = optionsDivRect.width + "px";
        this.divOptionsDropdownSelector.style.height = optionsDivRect.height + "px";
        this.divOptionsDropdownSelector.style.left = optionsDivRect.x + "px";
        this.divOptionsDropdownSelector.style.top = optionsDivRect.y + "px";

        // Position the dropdown
        this.divOptionsDropdown.style.left = optionsDivRect.x + "px";
        this.divOptionsDropdown.style.top = optionsDivRect.y + optionsDivRect.height + "px";

        // Set track of mouse leaving both divs and then hiding them
        this.isMouseOverDropdownSelector = false;
        this.isMouseOverDropdown = false;
        this.divOptionsDropdownSelector.onmouseenter = (event) => {
            this.isMouseOverDropdownSelector = true;
        }
        this.divOptionsDropdownSelector.onmouseleave = (event) => {
            this.isMouseOverDropdownSelector = false;

            // Need to give the mouse some time to jump to the other div
            setTimeout(() => {
                if(!this.isMouseOverDropdownSelector && !this.isMouseOverDropdown){
                    this.#hideOptionsDropdown();
                }
            }, 50);
        }
        this.divOptionsDropdown.onmouseenter = (event) => {
            this.isMouseOverDropdown = true;
        }
        this.divOptionsDropdown.onmouseleave = (event) => {
            this.isMouseOverDropdown = false;

            // Need to give the mouse some time to jump to the other div
            setTimeout(() => {
                if(!this.isMouseOverDropdownSelector && !this.isMouseOverDropdown){
                    this.#hideOptionsDropdown();
                }
            }, 50);
        }

        // Add selector and dropdown button container to DOM
        document.body.appendChild(this.divOptionsDropdownSelector);
        document.body.appendChild(this.divOptionsDropdown);


        this.renameButton = document.createElement("button");
        this.renameButton.innerHTML = `
        <button class="rounded-t-md border-b border-b-white w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200">
            <span>Rename</span>
        </button>
        `
        this.divOptionsDropdown.appendChild(this.renameButton);


        // If folder, it gets extra button to add file
        if(this.isFolder){
            this.addFileButton = document.createElement("button");
            this.addFileButton.innerHTML = `
            <button class="border-b border-b-white w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200">
                <span>Add File</span>
            </button>
            `
            this.divOptionsDropdown.appendChild(this.addFileButton);

            this.addFolderButton = document.createElement("button");
            this.addFolderButton.innerHTML = `
            <button class="border-b border-b-white w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200">
                <span>Add Folder</span>
            </button>
            `
            this.divOptionsDropdown.appendChild(this.addFolderButton);
        }


        this.copyButton = document.createElement("button");
        this.copyButton.innerHTML = `
        <button class="border-b border-b-white w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200">
            <span>Copy</span>
        </button>
        `
        this.divOptionsDropdown.appendChild(this.copyButton);

        this.cutButton = document.createElement("button");
        this.cutButton.innerHTML = `
        <button class="border-b border-b-white w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200">
            <span>Cut</span>
        </button>
        `
        this.divOptionsDropdown.appendChild(this.cutButton);

        this.pasteButton = document.createElement("button");
        this.pasteButton.innerHTML = `
        <button class="border-b border-b-white w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200">
            <span>Paste</span>
        </button>
        `
        this.divOptionsDropdown.appendChild(this.pasteButton);


        this.deleteButton = document.createElement("button");
        this.deleteButton.innerHTML = `
        <button class="rounded-b-md border-b border-b-white w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200">
            <span>Delete</span>
        </button>
        `
        this.divOptionsDropdown.appendChild(this.deleteButton);

        // Set tracking flag used to prohibit removing 
        // a second time if the cursor flies past both
        this.optionsDropdownShown = true;

        // Keep the row highlighted for now
        this.rowDiv.style.filter = "brightness(85%)";
    }


    #hideOptionsDropdown(){
        // If not already removed/hidden, remove and delete unneeded
        if(this.optionsDropdownShown){
            document.body.removeChild(this.divOptionsDropdownSelector);
            document.body.removeChild(this.divOptionsDropdown);

            delete this.divOptionsDropdownSelector;
            delete this.divOptionsDropdown;

            delete this.isMouseOverDropdownSelector;
            delete this.isMouseOverDropdown;

            this.optionsDropdownShown = false;

            // Un-highlight the row
            this.rowDiv.style.filter = "brightness(100%)";
        }
    }


    // Change icon div to folder with or without outline
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


    // Change icon div to file with or without outline
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


    // Add a child to this row and make this row into a parent/folder
    // row as long as this is not a file
    addChild(text, isFolder=true, isOpened=false){
        let child = new Row(text, this, isFolder, isOpened, this.project);
        this.childRows.push(child);
        this.project.saveProject();
        return child;
    }
}

export { Row }