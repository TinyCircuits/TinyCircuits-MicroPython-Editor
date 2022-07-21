import { Project } from "./project.js";


class Projects{
    constructor(divID, codeEditor){
        // The Projects main div in the layout
        this.div = document.getElementById(divID);

        // Each row will need to be able to add its own tab to the code editor, pass it down
        this.codeEditor = codeEditor;

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
        let newProject = new Project(name, this.div, this.closeProject, this.codeEditor);
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

            let project = this.addProject("MyGame");
            project.addFile("MyGame.py", false);
            project.saveProjectStructure();
        }else{
            for(let inx=0; inx<names.length; inx++){
                this.projects.push(new Project(names[inx], this.div, this.closeProject, this.codeEditor));
            }
        }
    }


    setToFolderSelectionMode(files, selectedCallback){
        for(let ipx=0; ipx<this.projects.length; ipx++){
            // Each project also has a function with the same name but takes a row
            this.projects[ipx].setToFolderSelectionMode(this.projects[ipx].rootRow, files, selectedCallback);
        }
    }

    unsetFromFolderSelectionMode(){
        for(let ipx=0; ipx<this.projects.length; ipx++){
            this.projects[ipx].unsetFromFolderSelectionMode(this.projects[ipx].rootRow);
        }
    }
}

export { Projects }