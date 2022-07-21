

class DB{
    constructor(DB_ID){
        this.DB_ID = DB_ID;
        this.DB_VER = 1;

        this.STORE_ID = DB_ID + "_STORE";
        this.STORE_INDEX = DB_ID + "_INDEX";
    }


    #initDB(successCallback){
        // Open database for files and handle any errors
        const request = indexedDB.open(this.DB_ID, this.DB_VER);

        request.onsuccess = (event) => {
            this.DB = event.target.result;

            successCallback();
        };

        request.onerror = (event) => {
            console.error(`Database error: ${event.target.errorCode}`);
        };

        // Can only create object stores (buckets) and search terms (index) when new DB opened or version changes
        request.onupgradeneeded = (event) => {
            this.DB = event.target.result;

            let editorStore = this.DB.createObjectStore(this.STORE_ID, {
                autoIncrement: true
            });
       

            editorStore.createIndex(this.STORE_INDEX, this.STORE_INDEX, {
                unique: false
            });
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
                }else{
                    successCallback(undefined);
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


    #getAll(storeBucket){
        return new Promise((resolve, reject) => {
            this.#initDB(() => {
                // Create a transaction with binary store in read only mode
                const txn = this.DB.transaction(storeBucket, 'readwrite');

                // Get the store/bucket
                const store = txn.objectStore(storeBucket);

                const all = store.getAll();

                all.onsuccess = (event) => {
                    resolve(event.target.result);
                }

                // Close the database connection
                txn.oncomplete = () => {
                    this.DB.close();
                };
            });
        });
    }


    addFile(dataBuffer, name){
        this.#addDBFile(dataBuffer, this.STORE_ID, this.STORE_INDEX, name);
    }

    getFile(name, successCallback){
        return this.#getDBFile(successCallback, this.STORE_ID, this.STORE_INDEX, name);
    }

    deleteFile(name){
        this.#deleteDBFile(this.STORE_ID, this.STORE_INDEX, name);
    }

    // Rename database by return new version under new name with all old content and then deleting old data base
    async rename(newName){
        let newDB = new DB(newName);

        const all = await this.#getAll(this.STORE_ID);

        for(let iix=0; iix<all.length; iix++){
            let keys = Object.keys(all[iix]);

            let path = all[iix][keys[0]];
            let data = all[iix][keys[1]];
            if(data == undefined) data ="";
            newDB.addFile(path, data);
        }

        indexedDB.deleteDatabase(this.DB_ID);

        return newDB;
    }
}

export { DB }