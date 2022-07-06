class ReadUntil{
    constructor(){
        // Decode from bytes when evaluating lines of incoming serial data
        this.decoder = new TextDecoder();

        // Flag that is set true when read until is taking in data
        this.isActive = false;

        // The string we are reading until
        this.readUntilString = undefined;

        // Timeout may ocur if the readUntilString is never found
        this.timeout = undefined;

        // Callback for when readUntilString is found or timeout occurs
        this.callback = undefined;

        // Sometimes it is necessary to wait for data to stop coming in and then fire callback
        this.forceWaitTimeout = undefined;


        // Portions of incoming data are stored here for stitching incoming serial
        // data in large enough sizes to find the readUntilString but small enough
        // be be fast
        this.searchingString = undefined;

        // Data collected while not being pushed out to console (array or typed arrays of varying sizes)
        this.accumulatedData = undefined;
    }


    activate(readUntilString, callback, forceWaitTimeout=false){
        this.isActive = true;
        this.readUntilString = readUntilString;
        this.callback = callback;
        this.forceWaitTimeout = forceWaitTimeout;
        this.searchingString = "";
        this.accumulatedData = [];
    }


    #deactivate(extraBytesCount){
        let callbackCopy = this.callback;
        let accumulatedDataCopy = this.accumulatedData;

        this.isActive = false;
        this.readUntilString = undefined;
        this.callback = undefined;
        this.forceWaitTimeout = undefined;
        this.searchingString = undefined;
        this.accumulatedData = undefined;

        callbackCopy(accumulatedDataCopy, extraBytesCount);
    }


    evaluate(data){
        this.searchingString += this.decoder.decode(data);
        
        let index = this.searchingString.indexOf(this.readUntilString);
        this.accumulatedData.push(data);

        if(index != -1){
            // readUntilString found
            let extraData = data.slice((index - Math.abs(this.searchingString.length - data.length)) + this.readUntilString.length);

            // Found readUntilString, allow the callback to run
            let extraBytesCount = this.readUntilString.length + extraData.length;

            this.#deactivate(extraBytesCount);
        }else{
            // readUntilString not found, remove some of the searchingString so it doesn't
            // take as long to find the readUntilString next time, also saves memory
            if(this.searchingString.length >= this.readUntilString.length*2){
                this.searchingString = this.searchingString.substring(this.searchingString.length - this.readUntilString.length);
            }
        }
    }
}

export { ReadUntil }