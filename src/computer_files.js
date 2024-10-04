class ComputerFiles{
    constructor(){
        this.dir_handle = undefined;
        this.tree = undefined;
    }

    get_tree = () => {
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
            }else if(handle.kind == "directory"){
                let content = [];
                list.push({name:handle.name, path:full_path, content:content})
                this.build_tree(handle, content, full_path, false)
            }

            // Go to the next iterator handle
            entry = await entry_iterator.next();
        }
    }

    // Call this to open file directory chooser on computer
    open_files = () => {
        // Define what to do when the user does choose a directory
        let chose_directory_success = async (result) => {
            this.dir_handle = result;

            this.tree = [];
            this.build_tree(this.dir_handle, this.tree, "");
            console.log(this.tree);
        }

        // Define what to do when the user does not choose a directory
        let chose_directory_fail = (result) => {
            console.error(result);
        }

        // Show the user the OS directory picker
        showDirectoryPicker().then(chose_directory_success, chose_directory_fail);
    }
}

export default ComputerFiles;