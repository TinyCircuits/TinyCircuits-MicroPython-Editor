class Row{
    constructor(text, parent, isFolder, project){
        // Each row gets text, parent row, flag for being a folder, and children
        this.text = text;
        this.parent = parent;
        this.isFolder = isFolder;
        this.project = project;
        this.childRows = [];

        // Row expander contains this row as well as child rows for easy setting of the background color
        this.rowExpanderDiv = document.createElement("div");

        // The actual div contained in the expander row
        this.rowDiv = document.createElement("div");
        this.rowExpanderDiv.appendChild(this.rowDiv);


        this.rowDiv.onclick = (event) => {
            console.log(this.text);
        }

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
            this.rowDiv.appendChild(this.optionsDiv);

            // Text div is the div to the right of the icon div and contains folder/file name
            this.textDiv = document.createElement("div");
            this.textDiv.classList = "min-w-fit h-6 text-black absolute select-none whitespace-nowrap";
            this.textDiv.style.marginLeft = 22 + ((this.parentCount - 1) * 12) + "px";
            this.textDiv.textContent = this.text;
            this.rowDiv.appendChild(this.textDiv);
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
    addChild(text, isFolder=true){
        let child = new Row(text, this, isFolder, this.project);
        this.childRows.push(child);
        this.project.saveProject();
        return child;
    }
}


// A Project is tracked by Projects and contain
//  * Rows (starting with root row)
//  * Ledger (project name) for database of files
//  * Tracking of open files in code tabs
//  * Tracking of open files in sprite
class Project{
    constructor(projectName, div, closeCallback){
        this.projectName = projectName;
        this.div = div;

        // Called when this project is closed so Projects can remove it from list
        this.closeCallback = closeCallback;

        this.#restoreProject();
    }


    // Recursively get the project structure as a dict of names of folders/files
    #getProjectHierarchy(row, dict){
        for(let icx=0; icx<row.childRows.length; icx++){
            dict[row.childRows[icx].text] = {};
            this.#getProjectHierarchy(row.childRows[icx], dict[row.childRows[icx].text]);
        }
    }


    // Recursively re-add each row of the project
    #restoreProjectHierarchy(row, dict){
        for (const [name, childrenDict] of Object.entries(dict)) {
            let newRow = row.addChild(name);
            this.#restoreProjectHierarchy(newRow, childrenDict);
        }
    }


    // Saves dictionary representation of this project's hierarchy
    saveProject(){
        let hierarchy = {};
        this.#getProjectHierarchy(this.rootRow, hierarchy);
        localStorage.setItem("Project" + this.projectName, JSON.stringify(hierarchy));
    }


    // Restores the project divs/tree from the saved project hierarchy
    #restoreProject(){
        let hierarchy = JSON.parse(localStorage.getItem("Project" + this.projectName));

        // Always start with root row and project row
        this.rootRow = new Row("", this.div, true, this);
        this.projectRow = this.rootRow.addChild(this.projectName, true);

        // Restore from saved if available
        if(hierarchy != null){
            this.#restoreProjectHierarchy(this.projectRow, hierarchy[this.projectName]);
        }

        // Save the project even if already saved to handle condition when project was not saved before (new)
        this.saveProject();
    }


    // Add file to project (each row will dictate adding more files themselves)
    addFile(fileName){
        let newRow = this.projectRow.addChild(fileName, false);
        this.saveProject();
        return newRow;
    }


    // Add folder to project (each row will dictate adding more files themselves)
    addFolder(fileName){
        let newRow = this.projectRow.addChild(fileName);
        this.saveProject();
        return newRow;
    }
}


class Projects{
    constructor(div){
        // The Projects main div in the layout
        this.div = div;

        // List of Project classes for each added/restored
        // project that may remain empty or restore from
        // storage
        this.projects = [];
        this.#restoreProjects();
    }


    // Adds new project to projects list
    addProject(name){
        // First, check that is this hasn't been used before
        // by comparing names, otherwise show an error to the user
        for(let ipx=0; ipx<this.projects.length; ipx++){
            if(name == this.projects[ipx].projectName){
                window.showError("A project with this name already exists (" + name + "), please close it first");
                return;
            }
        }

        // Second, add the project with name and close callback
        let newProject = new Project(name, this.div, this.closeProject);
        this.projects.push(newProject);

        this.#saveProjectNames();

        return newProject;
    }


    // Closes a project, removes it from list, and then re-saves list of project instances to localstorage
    closeProject(name){
        for(let ipx=0; ipx<this.projects.length; ipx++){
            if(this.projects[ipx].projectName == name){
                this.projects.remove(ipx);
            }
        }

        this.#saveProjectNames();
    }


    // Each project name is unique and used as a ledger to 
    // fetch each project's related localstorage data
    #saveProjectNames(){
        let names = [];
        for(let ipx=0; ipx<this.projects.length; ipx++){
            names.push(this.projects[ipx].projectName);
        }

        localStorage.setItem("ProjectNames", JSON.stringify(names));
    }


    // Uses saved project names to restore each project (each
    // project restores its own saved list of project names/files)
    #restoreProjects(){
        let names = JSON.parse(localStorage.getItem("ProjectNames"));

        // If nothing stored, no projects must have existed and so start from
        // a blank list and add one, otherwise go through restoration process
        if(names == null){
            this.projects = [];

            let project = this.addProject("HelloWorldProject");
            project.addFile("HelloWorld.py").addChild("Hi");
            project.saveProject();
        }else{
            for(let inx=0; inx<names.length; inx++){
                this.projects.push(new Project(names[inx], this.div, this.closeProject));
            }
        }
    }
}

export { Projects }