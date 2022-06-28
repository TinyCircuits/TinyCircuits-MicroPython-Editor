import { Row } from "./row.js";
import { DB } from "../db/js/db.js";

// A Project is tracked by Projects and contain
//  * Rows (starting with root row)
//  * Ledger (project name) for database of files
//  * Tracking of open files in code tabs
//  * Tracking of open files in sprite
class Project{
    constructor(projectName, div, closeCallback, codeEditor){
        this.projectName = projectName;
        this.div = div;

        // Each row will need to be able to add its own tab to the code editor, pass it down
        this.codeEditor = codeEditor;

        // Called when this project is closed so Projects can remove it from list
        this.closeCallback = closeCallback;

        // Create a database with the project name to make it unique
        // to other projects (more than one project with the same name 
        // should not be able to exist on the page at the same time)
        this.DB = new DB(this.projectName);

        this.#restoreProjectStructure();
    }


    // Recursively get the project structure as a dict of names of folders/files
    #getProjectHierarchy(row, dict){
        for(let icx=0; icx<row.childRows.length; icx++){
            dict[row.childRows[icx].text] = [row.childRows[icx].isFolder, row.childRows[icx].isOpened, {}];    // Persistent project row/tab data gets added here
            this.#getProjectHierarchy(row.childRows[icx], dict[row.childRows[icx].text][2]);    // Persistent project edit this
        }
    }


    // Recursively re-add each row of the project
    #restoreProjectHierarchy(row, dict){
        for (const [name, childrenDict] of Object.entries(dict)) {
            let newRow = row.addChild(name, childrenDict[0], childrenDict[1]); // Persistent project edit this
            this.#restoreProjectHierarchy(newRow, childrenDict[2]);            // Persistent project edit this
        }
    }


    // Saves dictionary representation of this project's hierarchy
    saveProjectStructure(){
        let hierarchy = {};
        this.#getProjectHierarchy(this.rootRow, hierarchy);
        localStorage.setItem("Project" + this.projectName, JSON.stringify(hierarchy));
    }


    // Restores the project divs/tree from the saved project hierarchy
    #restoreProjectStructure(){
        let hierarchy = JSON.parse(localStorage.getItem("Project" + this.projectName));

        // Always start with root row and project row
        this.rootRow = new Row("", this.div, true, false, this, this.codeEditor);
        this.projectRow = this.rootRow.addChild(this.projectName, true);

        // Restore from saved if available
        if(hierarchy != null){
            this.#restoreProjectHierarchy(this.projectRow, hierarchy[this.projectName][2]); // Persistent project edit this
        }

        // Save the project structure even if already saved to
        // handle condition when project was not saved before (new)
        this.saveProjectStructure();
    }


    // Add file to project (each row will dictate adding more files themselves)
    addFile(fileName){
        let newRow = this.projectRow.addChild(fileName, false);
        this.saveProjectStructure();
        return newRow;
    }


    // Add folder to project (each row will dictate adding more folders themselves)
    addFolder(fileName){
        let newRow = this.projectRow.addChild(fileName);
        this.saveProjectStructure();
        return newRow;
    }


    // Goes through every entry and checks if the passed filePath exists in the project already
    doesPathExist(filePath, row){
        if(row == undefined){
            return this.doesPathExist(filePath, this.rootRow);
        }else{
            for(let icx=0; icx<row.childRows.length; icx++){
                if(filePath == row.childRows[icx].filePath){
                    return true;
                }else if(this.doesPathExist(filePath, row.childRows[icx])){
                    return true;
                }
            }
        }
        return false;
    }


    // Projects will call this when user has picked files to add to the project
    setToFolderSelectionMode(row, files, selectedCallback){
        if(row.isRoot == false){
            row.rowDiv.onclick = async (event) => {
                
                for(let ifx=0; ifx<files.length; ifx++){
                    // First check that the new incoming file doesn't exist here
                    let path = row.getPath() + row.text + "/" + files[ifx].name;
                    if(this.doesPathExist(path, row) == false){
                        let newRow = row.addChild(files[ifx].name, false);
                        let buffer = new Uint8Array(await files[ifx].arrayBuffer());
                        this.DB.addFile(buffer, newRow.filePath);
                    }else{
                        window.showError("Could not add file, file with name '" + files[ifx].name + "' already exists in the directory");
                    }
                }

                selectedCallback();
            }
        }

        for(let icx=0; icx<row.childRows.length; icx++){
            if(row.childRows[icx].isFolder){
                this.setToFolderSelectionMode(row.childRows[icx], files, selectedCallback);
            }else{
                row.childRows[icx].rowDiv.disabled = true;
                row.childRows[icx].rowDiv.style.cursor = "default";
                row.childRows[icx].rowDiv.style.backgroundColor = "rgb(107 114 128)";
            }
        }
    }

    // Projects will call this when user picked a location to add the files to
    unsetFromFolderSelectionMode(row){
        if(row.isRoot == false){
            row.rowDiv.onclick = undefined;
        }

        for(let icx=0; icx<row.childRows.length; icx++){
            if(row.childRows[icx].isFolder){
                this.unsetFromFolderSelectionMode(row.childRows[icx]);
            }else{
                row.childRows[icx].rowDiv.disabled = false;
                row.childRows[icx].rowDiv.style.cursor = null;
                row.childRows[icx].rowDiv.style.backgroundColor = null;
            }
        }
    }



    async save(dirHandle, row){
        if(row == undefined){
            row = this.projectRow;

            // Remove all base folders and then rewrite the whole structure to the location
            for await (const [name, handle] of dirHandle.entries()) {
                await dirHandle.removeEntry(name, {recursive: true});
            }
        }

        for(let icx=0; icx<row.childRows.length; icx++){
            if(row.childRows[icx].isFolder){
                dirHandle.getDirectoryHandle(row.childRows[icx].text, {create: true}).then((newDirHandle) => {
                    this.save(newDirHandle, row.childRows[icx]);
                })
            }else{
                this.DB.getFile(row.childRows[icx].filePath, (data) => {
                    dirHandle.getFileHandle(row.childRows[icx].text, {create: true}).then((fileHandle) => {
                        if(data != undefined){
                            fileHandle.createWritable().then((stream) => {
                                stream.write({type: "write", data: data}).then(() => {
                                    stream.close();
                                });
                            });
                        }
                    })
                });
            }
        }
    }
}

export { Project }