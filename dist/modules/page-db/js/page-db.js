

class PageDB{
    constructor(){
        this.PAGE_DB_ID = "THUMBY";
        this.PAGE_DB_VER = 1;

        this.EDITOR_STORE_ID = "EDITOR_STORE";
        this.EDITOR_STORE_INDEX = "EDITOR_FILES_INDEX";

        this.EMULATOR_STORE_ID = "EMULATOR_STORE";
        this.EMULATOR_STORE_INDEX = "EMULATOR_FLASH_INDEX";

        // this.EDITOR_BUCKET_ID = "EDITOR_BUCKET";
        // this.EDITOR_BUCKET_VER = 1;
        // this.EDITOR_FILE_TERM = "EDITOR_TAB_PATH";

        // this.EMULATOR_BUCKET_ID = "EMULATOR_BUCKET";
        // this.EMULATOR_BUCKET_VER = 1;
        // this.EMULATOR_FLASH_TERM = "EMULATOR_FLASH";
    }


    #initDB(successCallback){
        // Open database for files and handle any errors
        const request = indexedDB.open(this.PAGE_DB_ID, this.PAGE_DB_VER);
        request.onerror = (event) => {
            console.error(`Database error: ${event.target.errorCode}`);
        };

        // Can only create object stores (buckets) and search terms (index) when new DB opened or version changes
        request.onupgradeneeded = (event) => {
            this.DB = event.target.result;

            let editorStore = this.DB.createObjectStore(this.EDITOR_STORE_ID, {
                autoIncrement: true
            });

            let emulatorStore = this.DB.createObjectStore(this.EMULATOR_STORE_ID, {
                autoIncrement: true
            });
       

            editorStore.createIndex(this.EDITOR_STORE_INDEX, this.EDITOR_STORE_INDEX, {
                unique: false
            });

            emulatorStore.createIndex(this.EMULATOR_STORE_INDEX, this.EMULATOR_STORE_INDEX, {
                unique: false
            });
        };

        request.onsuccess = (event) => {
            this.DB = event.target.result;
            successCallback();
        };
    }


    #addDBFile(dataBuffer, storeBucket, indexTerm, term){
        this.#initDB(() => {
            // Create a transaction with binary store in read only mode
            const txn = this.DB.transaction(storeBucket, 'readwrite');

            // Get the store/bucket
            const store = txn.objectStore(storeBucket);

            // Get the index/search term from the store/bucket
            const index = store.index(indexTerm);

            let query = index.getKey(term);

            let fileEntry = {};
            fileEntry[indexTerm] = term;
            fileEntry["data"] = dataBuffer;

            // Return the result object on success
            query.onsuccess = (event) => {
                store.put(fileEntry, query.result);
            };

            // Handle the error case
            query.onerror = (event) => {;
                store.put(fileEntry);
            }

            // Close the database connection
            txn.oncomplete = () => {
                this.DB.close();
            };
        });
    }



    #getDBFile(successCallback, storeBucket, indexTerm, term){
        this.#initDB(() => {
            // Create a transaction with binary store in read only mode
            const txn = this.DB.transaction(storeBucket, 'readonly');

            // Get the store/bucket
            const store = txn.objectStore(storeBucket);

            // Get the index/search term from the store/bucket
            const index = store.index(indexTerm);

            // Use store to start a search/query for the entry with the current editor ID
            let query = index.get(term);

            // Return the result object on success
            query.onsuccess = (event) => {
                if(query.result != undefined){
                    successCallback(query.result.data);
                }
            };

            // Handle the error case
            query.onerror = (event) => {
                console.log(event.target.error);
            }

            // Close the database connection
            txn.oncomplete = () => {
                this.DB.close();
            };
        });
    }


    #deleteDBFile(storeBucket, indexTerm, term){
        this.#initDB(() => {
            // Create a transaction with binary store in read only mode
            const txn = this.DB.transaction(storeBucket, 'readwrite');

            // Get the store/bucket
            const store = txn.objectStore(storeBucket);

            // Get the index/search term from the store/bucket
            const index = store.index(indexTerm);

            var query = index.getKey(term);

            // Return the result object on success
            query.onsuccess = (event) => {
                try{
                    store.delete(query.result);
                }catch(err){
                    console.log("No file with key'", term, "'exists");
                }
            };

            // Handle the error case
            query.onerror = (event) => {
                console.log(event.target.error);
            }

            // Close the database connection
            txn.oncomplete = () => {
                this.DB.close();
            };
        });
    }


    addEditorFile(dataBuffer, term){
        this.#addDBFile(dataBuffer, this.EDITOR_STORE_ID, this.EDITOR_STORE_INDEX, term);
    }

    getEditorFile(term, successCallback){
        return this.#getDBFile(successCallback, this.EDITOR_STORE_ID, this.EDITOR_STORE_INDEX, term);
    }

    deleteEditorFile(term){
        this.#deleteDBFile(this.EDITOR_STORE_ID, this.EDITOR_STORE_INDEX, term);
    }



    addEmulatorFlash(dataBuffer, term){
        this.#addDBFile(dataBuffer, this.EMULATOR_STORE_ID, this.EMULATOR_STORE_INDEX, term);
    }

    getEmulatorFlash(term, successCallback){
        return this.#getDBFile(successCallback, this.EMULATOR_STORE_ID, this.EMULATOR_STORE_INDEX, term);
    }

    deleteEmulatorFlash(term){
        this.#deleteDBFile(this.EMULATOR_STORE_ID, this.EMULATOR_STORE_INDEX, term);
    }
}

export { PageDB }