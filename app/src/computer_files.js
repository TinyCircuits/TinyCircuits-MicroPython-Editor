class ComputerFiles{
    constructor(setTree){
        this.dir_handle = undefined;
        this.tree = undefined;
        this.full_path_files = undefined;   // A dictionary where full file paths are keys and file handles are values
        this.setTree = setTree;
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
            let full_path = path + "/" + handle.name;

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
    openFiles = async () => {
        return new Promise((resolve, reject) => {
            // Define what to do when the user does choose a directory
            let chose_directory_success = async (result) => {
                this.dir_handle = result;

                // Add the directly selected folder to the tree (root)
                this.tree = [];
                let content = [];
                this.tree.push({name:this.dir_handle.name, path:this.dir_handle.name, content:content});
                
                this.full_path_files = {};
                this.build_tree(this.dir_handle, content, this.dir_handle.name).then(() => {
                    this.setTree(this.tree);
                    resolve();
                }).catch((error) => {
                    console.error(error);
                    reject();
                });
            }

            // Define what to do when the user does not choose a directory
            let chose_directory_fail = (result) => {
                console.error(result);
                reject();
            }

            // Show the user the OS directory picker
            showDirectoryPicker().then(chose_directory_success, chose_directory_fail);
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
}

export default ComputerFiles;