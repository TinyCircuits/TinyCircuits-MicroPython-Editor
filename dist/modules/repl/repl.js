class Repl{
    constructor(){

        // Callback functions that should be tied to other code/modules externally
        this.onOutput = (data) => {};           // Print to console
        this.onWrite = (data, encode) => {};    // Write to serial

        // Decode from bytes when evaluating lines of incoming serial data
        this.decoder = new TextDecoder();

        // String used to hide and process device serial output
        this.readUntilStr = undefined;

        // Varying sized blocks of serial bytes in typed arrays are stored here
        // while all portions of the data are evaluated line by line until 
        // readUntilStr is found (if set to not undefined). This means readUntilStr 
        // cannot have any newlines!
        this.accumulatedData = [];

        // String that holds copy of incoming data with enough room for readUntilStr * 2
        this.searchingString = "";

        /// Callback that gets called when readUntilStr is found
        this.callback = () => {};

        // Called when readUntilStr reaches its timeout value (ms)
        this.timeoutFunc = () => {
            this.readUntilStr = undefined;
            this.callback();
        }
    }


    // Write data and set module state to accumulate data until readUntilStr found
    writeAndReadUntil(data, readUntilStr, timeout, callback = () => {}){
        this.readUntilStr = readUntilStr;
        this.searchingString = "";
        this.accumulatedData = [];
        this.callback = callback;

        // Store the timeout (ms) and setup first call to timeout
        this.timeout = timeout;
        this.timeoutID = setTimeout(this.timeoutFunc, this.timeout);

        this.onWrite(data);
    }


    // Called when serial connects to a device
    connected(){
        // Stop any running program (like the main menu from main.py)
        // https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326
        this.writeAndReadUntil("\r\x03\x03", ">>>", 150, () => {});
    }


    #removeReadUntilAndExtra(extraDataLength){
        // Total data is stored, remove the string that is/was readUntilStr + extra that came after.
        // The accumulatedData is an array of varying sized arrays, get rid of elements that are smaller
        // then what needs to be removed, and slice the last element keeping only the left most portion
        let totalToRemove = this.readUntilStr.length + extraDataLength;
        let removedCount = 0;
        let idx = this.accumulatedData.length-1;
        while(removedCount < totalToRemove){
            // If this element's size is less then that remaining to be removed total, remove the element entirely,
            // otherwise slice the element keeping only the left most portion
            if(this.accumulatedData[idx].length <= totalToRemove - removedCount){
                removedCount += this.accumulatedData[idx].length;
                this.accumulatedData[idx].remove(idx);
            }else{
                removedCount = totalToRemove;
                this.accumulatedData[idx] = this.accumulatedData[idx].slice(0, this.accumulatedData[idx].length - totalToRemove);
            }

            // Move onto the element before the one that was just removed
            idx -= 1;
        }
    }


    // Main data consumer, data comes here from serial before being output again
    consumeData(data){
        // Reset timeout when new data arrives
        clearTimeout(this.timeoutID, this.timeoutFunc);
        this.timeoutID = setTimeout(this.timeoutFunc, this.timeout);

        console.log(this.decoder.decode(data));

        // If no string for read until, output to external module (likely console),
        // otherwise accumulate, check, and process the data until that string is found
        if(this.readUntilStr == undefined){
            this.onOutput(data);
        }else{
            this.searchingString += this.decoder.decode(data);

            let index = this.searchingString.indexOf(this.readUntilStr);
            this.accumulatedData.push(data);

            if(index != -1){
                // readUntilStr found
                let extraData = data.slice((index - Math.abs(this.searchingString.length - data.length)) + this.readUntilStr.length);

                this.#removeReadUntilAndExtra(extraData.length);

                // Reset this and feed the extra data back into this function to be printed
                this.readUntilStr = undefined;
                this.consumeData(extraData);

                // Clear timeout so it is not called when it reaches time
                clearTimeout(this.timeoutID, this.timeoutFunc);

                // Found readUntilStr, allow the callback to run
                this.callback();
            }else{
                // readUntilStr not found, remove some of the searchingString so it doesn't
                // take as long to find the readUntilStr next time, also saves memory
                if(this.searchingString.length >= this.readUntilStr.length*2){
                    this.searchingString = this.searchingString.substring(this.searchingString.length - this.readUntilStr.length);
                }
            }
        }
    }
}

export { Repl }