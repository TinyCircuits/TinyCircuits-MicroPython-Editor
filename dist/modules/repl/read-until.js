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


        // Portions of incoming data are stored here for stitching incoming serial
        // data in large enough sizes to find the readUntilString but small enough
        // be be fast
        this.searchingString = undefined;

        // Data collected while not being pushed out to console (array or typed arrays of varying sizes)
        this.accumulatedData = undefined;

        // Number of bytes accumulated
        this.accumulatedDataLength = undefined;
    }


    activate(readUntilString, callback){
        this.isActive = true;
        this.readUntilString = readUntilString;
        this.callback = callback;
        this.searchingString = "";
        this.accumulatedData = [];
        this.accumulatedDataLength = 0;
    }


    #deactivate(finalData, extraData){
        let callbackCopy = this.callback;

        this.isActive = false;
        this.readUntilString = undefined;
        this.callback = undefined;
        this.searchingString = undefined;
        this.accumulatedData = undefined;
        this.accumulatedDataLength = undefined;

        callbackCopy(finalData, extraData);
    }


    evaluate(data){
        console.log(this.decoder.decode(data));
        this.searchingString += this.decoder.decode(data);
        
        let index = this.searchingString.indexOf(this.readUntilString);
        this.accumulatedDataLength += data.length;
        this.accumulatedData.push(data);

        if(index != -1){
            // readUntilString found
            let extraData = data.slice((index - Math.abs(this.searchingString.length - data.length)) + this.readUntilString.length)

            let totalToRemove = this.readUntilString.length + extraData.length;
            let finalData = new Uint8Array(this.accumulatedDataLength);
            let offset = 0;
            for(let idx=0; idx<this.accumulatedData.length; idx++){
                finalData.set(this.accumulatedData[idx], offset);
                offset += this.accumulatedData[idx].length;
            }

            this.#deactivate(finalData.slice(2, finalData.length-totalToRemove-2), extraData);
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