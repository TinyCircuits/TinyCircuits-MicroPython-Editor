class FilesConnection{
    constructor(){
        this.dir_handle = undefined;
    }

    // Call this to open file directory chooser on computer
    open_files = () => {
        // Define what to do when the user does choose a directory
        let chose_directory_success = async (result) => {
            this.dir_handle = result;

            let file_iterator = result.values();

            let file_iterator_entry = await file_iterator.next();

            while(file_iterator_entry.done == false){
                let file_system_handle = file_iterator_entry.value;

                console.log(file_system_handle.name);

                // Go to the next iterator handle
                file_iterator_entry = await file_iterator.next();
            }
        }

        // Define what to do when the user does not choose a directory
        let chose_directory_fail = (result) => {
            console.error(result);
        }

        // Show the user the OS directory picked
        showDirectoryPicker().then(chose_directory_success, chose_directory_fail);
    }
}

export default FilesConnection;