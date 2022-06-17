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
            dict[row.childRows[icx].text] = [row.childRows[icx].isFolder, row.childRows[icx].isOpened, {}];
            this.#getProjectHierarchy(row.childRows[icx], dict[row.childRows[icx].text][2]);
        }
    }


    // Recursively re-add each row of the project
    #restoreProjectHierarchy(row, dict){
        for (const [name, childrenDict] of Object.entries(dict)) {
            let newRow = row.addChild(name, childrenDict[0], childrenDict[1]);
            this.#restoreProjectHierarchy(newRow, childrenDict[2]);
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
            this.#restoreProjectHierarchy(this.projectRow, hierarchy[this.projectName][2]);
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
}

export { Project }