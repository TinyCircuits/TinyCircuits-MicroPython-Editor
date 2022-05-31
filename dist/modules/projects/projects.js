import { Project } from "./project.js";


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
            project.addFolder("HelloWorld").addChild("Hi.py", false);
            project.saveProject();
        }else{
            for(let inx=0; inx<names.length; inx++){
                this.projects.push(new Project(names[inx], this.div, this.closeProject));
            }
        }
    }
}

export { Projects }