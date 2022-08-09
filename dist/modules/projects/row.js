class Row{
    constructor(text, parent, isFolder, isOpened, openFileContents, project, codeEditor, spriteEditorManager, insertBeforeElement){
        // Each row gets text, parent row, flag for being a folder, and children
        this.text = text;
        this.parent = parent;
        this.isFolder = isFolder;
        this.project = project;
        this.codeEditor = codeEditor;
        this.spriteEditorManager = spriteEditorManager;
        this.childRows = [];

        // File contents need to have a unique key to get files from the passed project
        // and its database. Create a key based on the file's path to the project root
        this.filePath = this.getPath() + text;

        // Only for use on rows that are not folders and is used to fetch
        // this rows file contents and open in external editor
        this.isOpened = isOpened;
        if(this.isOpened){
            this.openFileContents(openFileContents);
        }

        // Set if root or not (root is the project parent div and not the row with the project name)
        this.isRoot = undefined;

        // Row expander contains this row as well as child rows for easy setting of the background color
        this.rowExpanderDiv = document.createElement("div");

        // The actual div contained in the expander row
        this.rowDiv = document.createElement("div");
        this.rowDiv.disabled = false;
        this.rowExpanderDiv.appendChild(this.rowDiv);


        // When a row is clicked and it is not a folder, root, 
        // a the first child of root, open it's contents
        this.rowDiv.ondblclick = (event) => {
            // A check is done in the function to check if actually a file
            this.openFileContents(true);
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

            // Div that contains the main row being added as well as room to expand as a parent (make sure file rows are placed before folder rows)
            this.rowExpanderDiv.classList = "min-w-full, min-h-fit flex flex-col";
            if(insertBeforeElement != undefined){
                this.parent.rowExpanderDiv.insertBefore(this.rowExpanderDiv, insertBeforeElement);
            }else{
                this.parent.rowExpanderDiv.appendChild(this.rowExpanderDiv);
            }

            // Setup row and make sure bg changes on hover (also set when project sets rows to disabled)
            this.rowDiv.classList = "min-w-full h-6 bg-base-200 cursor-pointer";
            this.rowDiv.onmouseenter = (event) => {
                if(this.rowDiv.disabled == false){
                    this.rowDiv.classList.remove("bg-base-200");

                    this.rowDiv.classList.add("bg-base-300");
                    this.optionsDiv.classList.remove("invisible");
                }
            }
            this.rowDiv.onmouseleave = (event) => {
                if(this.rowDiv.disabled == false){
                    this.rowDiv.classList.remove("bg-gray-300");

                    this.rowDiv.classList.add("bg-base-200");
                    this.optionsDiv.classList.add("invisible");
                }
            }

            // Icon div can be a folder or file depending on flag
            // that is set by force or by adding children to a row
            this.iconDiv = document.createElement("div");
            this.iconDiv.classList = "w-6 h-6 absolute left-0 mt-0.5";
            this.iconDiv.style.marginLeft = ((this.parentCount - 1) * 16) + "px";
            if(this.isFolder){
                this.useFolderIcon();
            }else{
                this.useDocumentIcon();
            }
            this.rowDiv.appendChild(this.iconDiv);

            // Options div is always same and exists to indicate to the user that they can click it
            this.optionsDiv = document.createElement("div");
            this.optionsDiv.classList = "w-6 h-6 absolute right-0 invisible mt-0.5 rounded-full hover:stroke-accent";
            this.optionsDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-accent" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
            `;
            this.optionsDiv.onclick = (event) => {
                this.#showOptionsDropdown();
            }
            this.rowDiv.appendChild(this.optionsDiv);

            // Text div is the div to the right of the icon div and contains folder/file name
            this.textDiv = document.createElement("div");
            this.textDiv.classList = "min-w-fit h-6 absolute select-none whitespace-nowrap";
            this.textDiv.style.marginLeft = 22 + ((this.parentCount - 1) * 16) + "px";
            this.textDiv.textContent = this.text;
            this.rowDiv.appendChild(this.textDiv);
        }
    }


    getPath(){
        if(!this.isRoot){
            let path = "";

            let tempParent = this.parent;
            while(tempParent.parent != undefined){
                path = tempParent.text + "/" + path;
                tempParent = tempParent.parent;
            }
            return path;
        }
    }


    // Opens the file contents if really a file
    openFileContents(select){
        if(!this.isRoot && !this.parent.isRoot && !this.isFolder){
            console.log("Opening " + this.text);

            // Set flag and make sure state/structure is saved
            this.isOpened = true;

            this.project.DB.getFile(this.filePath, (data) => {
                
                this.save = (data) => {
                    this.project.DB.addFile(data, this.filePath);
                }

                // Figure out what type of tab to use
                this.tab = undefined;
                if(this.filePath.indexOf(".spr") != -1){
                    this.tab = this.spriteEditorManager.addTab(this.filePath, data, this.save.bind(this));
                }else{
                    // Code editor only takes strings, convert if not a string type array
                    if(typeof data == "object"){
                        data = new TextDecoder().decode(data);
                    }

                    this.tab = this.codeEditor.openFile(this.filePath, data, this.save.bind(this));
                }

                // If the tab already existed in its current editor tab manager, then it may be undefined still
                if(this.tab != undefined){
                    // Hook up its events and select it if it was selected before
                    this.tab.onClose = () => {
                        this.isOpened = false;
                        this.project.saveProjectStructure();
                    }

                    if(select){
                        this.tab.select();
                    }

                    this.project.saveProjectStructure();
                }
            });

            console.log(this.filePath);
        }
    }


    // Change icon div to folder with or without outline
    useFolderIcon(outline=false){
        if(this.iconDiv != undefined){
            if(!outline){
                this.iconDiv.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-accent" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    `;
            }else{
                this.iconDiv.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-accent" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                    </svg>
                    `;
            }else{
                this.iconDiv.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    `;
            }
        }
        this.isFolder = false;
    }


    // Add a child to this row and make this row into a parent/folder
    // row as long as this is not a file
    addChild(text, isFolder=true, isOpened=false, openFileContents=false){
        // Find the first folder element so that file rows can be placed before it
        let firstFolderElement = undefined;
        if(isFolder == false){
            for(let icx=0; icx<this.childRows.length; icx++){
                if(this.childRows[icx].isFolder){
                    firstFolderElement = this.childRows[icx].rowExpanderDiv;
                    break;
                }
            }
        }

        let child = new Row(text, this, isFolder, isOpened, openFileContents, this.project, this.codeEditor, this.spriteEditorManager, firstFolderElement);
        this.childRows.push(child);
        this.project.saveProjectStructure();
        return child;
    }


    // Update each row's children by calling the rename function with the same name
    #updateChildFilePaths(row){
        for(let icx=0; icx<row.childRows.length; icx++){
            row.childRows[icx].#rename(row.childRows[icx].text);
            if(row.childRows[icx].isFolder){
                this.#updateChildFilePaths(row.childRows[icx]);
            }
        }
    }


    #rename(text){
        // Generate a file path based on the new name and check if it exists already in the project
        let filePath = this.getPath() + text;
        if(this.project.doesPathExist(filePath) == false){
            // Set this row's text and visible text
            this.text = text;
            this.textDiv.textContent = this.text;

            // Depending on if renaming a file, a folder, or a folder that is root, do different things
            if(this.isFolder){
                if(this.parent.isRoot){
                    this.project.updateProjectName(text);
                }
                this.#updateChildFilePaths(this);
                this.project.saveProjectStructure();
            }else{

                // Get this file's contents using the old project's file path and replace everything under the new path
                this.project.DB.getFile(this.filePath, (data) => {
                    this.project.DB.deleteFile(this.filePath);
                    
                    this.filePath = filePath;
                    this.project.DB.addFile(data, this.filePath);

                    // Change the linked code editors path (which in turn changes the code editor tab visible text)
                    if(this.tab){
                        this.tab.changeFilePath(this.filePath);
                    }
                    
                    this.project.saveProjectStructure();
                });
            }
        }else{
            window.showError("Did not rename, that file path already exists");
        }
    }


    #showOptionsDropdown(){
        let rename = (dialog, defaultValue) => {
            window.inputDialog(dialog, defaultValue, this.#rename.bind(this))
        }

        let newFolder = (event) => {
            window.inputDialog("New folder name:", "NewFolder", (text) => {
                // Check if path exists, if not, create new file under this folder
                if(this.project.doesPathExist(this.getPath() + this.text + "/" + text) == false){
                    this.addChild(text, true, false);
                }else{
                    window.showError("This folder already exists, did not create");
                }
            });
        }

        let newFile = (event) => {
            window.inputDialog("New file name:", "NewFile.py", (text) => {
                // Check if path exists, if not, create new file under this folder
                if(this.project.doesPathExist(this.getPath() + this.text + "/" + text) == false){
                    this.addChild(text, false, false);
                }else{
                    window.showError("This file already exists, did not create");
                }
            });
        }

        let deleteFileFolder = (event) => {
            this.#askDelete();
        }

        this.divOptionsDropdown = document.createElement("div");
        this.divOptionsDropdown.classList = "absolute";
        if(this.isFolder){
            this.divOptionsDropdown.innerHTML = `
            <div class="dropdown dropdown-open z-[1000]">
                <ul tabindex="0" class="dropdown-content menu p-1 shadow bg-base-300 rounded-box w-fit whitespace-nowrap">
                    <label for="modalInput"><li><a>Rename</a></li></label>
                    <label for="modalInput"><li><a>New Folder</a></li></label>
                    <label for="modalInput"><li><a>New File</a></li></label>
                    <label for="modalConfirm"><li><a>Delete</a></li></label>
                </ul>
            </div>
            `

            this.divOptionsDropdown.children[0].children[0].children[0].onclick = () => {rename("Rename folder to:", this.text)};
            this.divOptionsDropdown.children[0].children[0].children[1].onclick = newFolder;
            this.divOptionsDropdown.children[0].children[0].children[2].onclick = newFile;
            this.divOptionsDropdown.children[0].children[0].children[3].onclick = deleteFileFolder;
        }else{
            this.divOptionsDropdown.innerHTML = `
            <div class="dropdown dropdown-open z-[1000]">
                <ul tabindex="0" class="dropdown-content menu p-1 shadow bg-base-300 rounded-box w-fit whitespace-nowrap">
                    <label for="modalInput"><li><a>Rename</a></li></label>
                    <label for="modalConfirm"><li><a>Delete</a></li></label>
                </ul>
            </div>
            `

            this.divOptionsDropdown.children[0].children[0].children[0].onclick = () => {rename("Rename file to:", this.text)};
            this.divOptionsDropdown.children[0].children[0].children[1].onclick = deleteFileFolder;
        }
        document.body.appendChild(this.divOptionsDropdown);

        // Get the rect of the clicked div to cover with selector
        let optionsDivRect = this.optionsDiv.getBoundingClientRect();

        // Position the dropdown
        this.divOptionsDropdown.style.left = optionsDivRect.x + "px";
        this.divOptionsDropdown.style.top = optionsDivRect.y - optionsDivRect.height + "px";

        // Keep the row highlighted for now
        this.rowDiv.style.filter = "brightness(85%)";

        this.divOptionsDropdown.onmouseleave = (event) => {
            this.#hideOptionsDropdown();
        }
    }


    #hideOptionsDropdown(){
        if(this.divOptionsDropdown){
            // Remove options dropdown
            document.body.removeChild(this.divOptionsDropdown);
            delete this.divOptionsDropdown;

            // Un-highlight the row
            this.rowDiv.style.filter = "brightness(100%)";
        }
    }


    // Delete folders should result in all child file and folders also being deleted
    #deleteChildren(row){
        while(row.childRows.length > 0){
            if(row.childRows[0].isFolder){
                this.#deleteChildren(row.childRows[0]);
            }
            row.childRows[0].#delete();
        }
    }


    // Goes through the process of removing the database file at this file path and closing an file editors
    #delete(){
        if(this.tab){
            this.tab.close();
        }

        this.project.DB.deleteFile(this.filePath);

        this.parent.rowExpanderDiv.removeChild(this.rowExpanderDiv);

        // Find this row in the parent's childRows and remove it
        for(let icx=0; icx<this.parent.childRows.length; icx++){
            if(this.parent.childRows[icx].filePath == this.filePath){
                this.parent.childRows.remove(icx);
                break;
            }
        }

        // If this is a folder, also delete all the child files and folders
        if(this.isFolder){
            this.#deleteChildren(this);
        }

        this.#hideOptionsDropdown();

        this.project.saveProjectStructure();
    }


    // Removes row from parent childRows, removes HTML, remove DB file, and close code editor tab if it exists
    #askDelete(){
        window.confirm("Are you sure you want to delete this? It will not be recoverable in any way.\n\nThis also means the selected will be erased from its location on your PC, Thumby, or Google Drive next time the project is saved.", () => {
            this.#delete();
        });
    }
}

export { Row }