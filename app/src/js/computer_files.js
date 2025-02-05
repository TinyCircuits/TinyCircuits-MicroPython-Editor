class ComputerFiles{
    constructor(setTree, progressCB = (percent) => {}){
        this.dir_handle = undefined;
        this.tree = undefined;
        this.full_path_files = undefined;   // A dictionary where full file paths are keys and file handles are values
        this.setTree = setTree;
        this.progressCB = progressCB;
    }

    getTree = () => {
        return this.tree;
    }

    // Assuming `directory_handle` is a `FilesystemDirectoryHandle`, build
    // list containing dictionaries representing the full tree under the
    // the based folder handle
    build_tree = async (directory_handle, list, path) => {
        // Get iterator for folder and then the first entry
        let entry_iterator = directory_handle.values();
        let entry = await entry_iterator.next();

        // Go through all entries one by one and add to content if not `start`
        // and also search child folders and add them to content as well
        while(entry.done == false){
            // Get the file or directory handle from iterator
            // and build path
            let handle = entry.value;
            let full_path = (path == "" ? "" : path + "/") + handle.name;   // Change from `/dir` to `dir` when `path == ""` initially

            // Add file or directory entry to current list, and
            // search directories recursively
            if(handle.kind == "file"){
                let file = await handle.getFile();
                let size = file.size;

                list.push({name:handle.name, path:full_path, size:size})

                // For opening files, need a dictionary with full paths as keys
                // and file handles as values
                this.full_path_files[full_path] = handle;
            }else if(handle.kind == "directory"){
                let content = [];
                list.push({name:handle.name, path:full_path, content:content})
                await this.build_tree(handle, content, full_path, false);
            }

            // Go to the next iterator handle
            entry = await entry_iterator.next();
        }
    }

    // Call this to open file directory chooser on computer
    openFiles = async (refresh=false) => {
        return new Promise((resolve, reject) => {
            // Define what to do when the user does choose a directory
            let chose_directory_success = async (result) => {
                this.dir_handle = result;

                // Add the directly selected folder to the tree (root)
                this.tree = [];
                let content = [];
                this.tree.push({name:this.dir_handle.name, path:this.dir_handle.name, content:content});
                
                this.progressCB(0.6);

                this.full_path_files = {};
                this.build_tree(this.dir_handle, content, "").then(() => {
                    this.setTree(this.tree);
                    resolve();
                    this.progressCB(1.0);
                }).catch((error) => {
                    console.error(error);
                    reject();
                    this.progressCB(1.0);
                });
            }

            // Define what to do when the user does not choose a directory
            let chose_directory_fail = (result) => {
                console.error(result);
                reject();
                this.progressCB(1.0);
            }

            this.progressCB(0.01);

            // Show the user the OS directory picker
            if(refresh){
                chose_directory_success(this.dir_handle);
            }else{
                showDirectoryPicker().then(chose_directory_success, chose_directory_fail);
            }
        });
    }

    openFile = async (path) => {
        let file = await this.full_path_files[path].getFile();
        return new Uint8Array(await file.arrayBuffer());
    }

    saveFile = async (path, valueToSave) => {
        const writable = await this.full_path_files[path].createWritable();
        await writable.write(valueToSave);
        await writable.close();
    }

    #find = async (fullPath, rebuiltPath, parentDirHandle) => {
        for await (const [name, handle] of parentDirHandle.entries()){
            const checkPath = rebuiltPath + (rebuiltPath == "" ? "" : "/") + name;

            if(fullPath == checkPath){
                return [name, handle, parentDirHandle];
            }else if(handle.kind == "directory"){
                const [name, found, parent] = await this.#find(fullPath, checkPath, handle);

                if(name != undefined){
                    return [name, found, parent];
                }
            }
        }

        return [undefined, undefined, undefined];
    }

    rename = async (oldPath, newPath) => {
        // Find info about the element being renamed
        const [name, foundHandle, foundParentHandle] = await this.#find(oldPath, "", this.dir_handle);
        
        if(name == undefined){
            throw new Error("ComputerFiles rename ERROR: Could not find '" + oldPath + "' for renaming!");
        }

        if((await this.#find(newPath, "", this.dir_handle))[0] != undefined){
            throw new Error("ComputerFiles rename ERROR: Path '" + newPath + "' already exists, could not rename!");
        }

        const newName = newPath.split("/").pop();

        // If the element being renamed is a file, simple copy and delete.
        // If it's a directory, complex recursive copy and delete
        if(foundHandle.kind == "file"){
            const oldFile = await foundHandle.getFile();
            const newFile = await foundParentHandle.getFileHandle(newName, {create:true});

            const fileData = await oldFile.arrayBuffer();
            
            const writable = await newFile.createWritable();
            await writable.write(fileData);
            await writable.close();

            await this.delete(oldPath);
        }else if(foundHandle.kind == "directory"){
            let newFoundParentHandle = await foundParentHandle.getDirectoryHandle(newName, {create:true});

            const copy = async (lastName, oldHandleParent, newHandleParent) => {
                for await (const [name, handle] of oldHandleParent.entries()){
                    if(lastName == name){
                        continue;
                    }

                    if(handle.kind == "file"){
                        const oldFile = await handle.getFile();
                        const newFile = await newHandleParent.getFileHandle(name, {create:true});

                        const fileData = await oldFile.arrayBuffer();
                        
                        const writable = await newFile.createWritable();
                        await writable.write(fileData);
                        await writable.close();
                    }else if(handle.kind == "directory"){
                        await copy(name, handle, await newHandleParent.getDirectoryHandle(name, {create:true}));
                    }
                }
            }

            await copy(newName, foundHandle, newFoundParentHandle);
            await this.delete(oldPath);
        }
    }

    delete = async (path) => {
        const [name, foundHandle, foundParentHandle] = await this.#find(path, "", this.dir_handle);

        if(name != undefined){
            await foundParentHandle.removeEntry(name, {recursive:true});
        }
    }
}

export default ComputerFiles;