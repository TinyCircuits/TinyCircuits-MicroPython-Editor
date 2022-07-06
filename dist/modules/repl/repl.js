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


class Repl{
    constructor(){
        // Callback functions that should be tied to other code/modules externally
        this.onOutput = (data) => {};           // Print to console
        this.onWrite = (data, encode) => {};    // Write to serial

        // Make a read until object for processing incoming data
        this.readUntil = new ReadUntil();
    }


    // Called when serial connects to a device
    async connected(){
        let gotNormal = false;

        this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
            this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
                await this.onWrite("\x02");     // Get a normal/friendly prompt
                gotNormal = true;
            });
            await this.onWrite("\x04");         // Soft reset/exit raw mode
        });
        await this.onWrite("\x03\x03");   // Interrupt any running program (https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326)
        await this.onWrite("\x01");       // Enter raw mode if not already

        // Hang this function until the normal prompt bytes are sent so that
        // functions calling this can await this function and continue once
        // all the way through the repl setup process
        while(gotNormal == false){
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }


    // Main data consumer, data comes here from serial before being output again
    consumeData(data){
        if(!this.readUntil.isActive){
            this.onOutput(data);
        }else{
            this.readUntil.evaluate(data);
        }
    }


    async test(){
        await this.onWrite("\x01");
    }
}

export { Repl }




// class Repl{
//     constructor(){
//         // Callback functions that should be tied to other code/modules externally
//         this.onOutput = (data) => {};           // Print to console
//         this.onWrite = (data, encode) => {};    // Write to serial

//         // Decode from bytes when evaluating lines of incoming serial data
//         this.decoder = new TextDecoder();

//         // String used to hide and process device serial output
//         this.readUntilStr = undefined;

//         // Varying sized blocks of serial bytes in typed arrays are stored here
//         // while all portions of the data are evaluated line by line until 
//         // readUntilStr is found (if set to not undefined). This means readUntilStr 
//         // cannot have any newlines!
//         this.accumulatedData = [];

//         // String that holds copy of incoming data with enough room for readUntilStr * 2
//         this.searchingString = "";

//         // Callback for when readUntilStr is found
//         this.callback = undefined;
//     }


//     // Write data and set module state to accumulate data until readUntilStr found
//     writeAndReadUntil(data, readUntilStr, callback){
//         this.readUntilStr = readUntilStr;
//         this.searchingString = "";
//         this.accumulatedData = [];
//         this.callback = callback;
//         this.onWrite(data);
//     }


//     // Called when serial connects to a device
//     connected(){
//         // Stop any running program (like the main menu from main.py)
//         // https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326
//         this.writeAndReadUntil("\r\x03\x03", ">>>", () => {
//             // Now check that utility files exist
//             // this.onWrite("\r\x01");
//             // this.writeAndReadUntil("\r\x01", ">", () => {
                
//             // });
//         });
//     }


//     #removeReadUntilAndExtra(extraDataLength){
//         // Total data is stored, remove the string that is/was readUntilStr + extra that came after.
//         // The accumulatedData is an array of varying sized arrays, get rid of elements that are smaller
//         // then what needs to be removed, and slice the last element keeping only the left most portion
//         let totalToRemove = this.readUntilStr.length + extraDataLength;
//         let removedCount = 0;
//         let idx = this.accumulatedData.length-1;
//         while(removedCount < totalToRemove){
//             // If this element's size is less then that remaining to be removed total, remove the element entirely,
//             // otherwise slice the element keeping only the left most portion
//             if(this.accumulatedData[idx].length <= totalToRemove - removedCount){
//                 removedCount += this.accumulatedData[idx].length;
//                 this.accumulatedData[idx].remove(idx);
//             }else{
//                 removedCount = totalToRemove;
//                 this.accumulatedData[idx] = this.accumulatedData[idx].slice(0, this.accumulatedData[idx].length - totalToRemove);
//             }

//             // Move onto the element before the one that was just removed
//             idx -= 1;
//         }
//     }


//     // Main data consumer, data comes here from serial before being output again
//     consumeData(data){
//         // If no string for read until, output to external module (likely console),
//         // otherwise accumulate, check, and process the data until that string is found
//         if(this.readUntilStr == undefined){
//             this.onOutput(data);
//         }else{
//             this.searchingString += this.decoder.decode(data);
            
//             let index = this.searchingString.indexOf(this.readUntilStr);
//             this.accumulatedData.push(data);

//             if(index != -1){
//                 // readUntilStr found
//                 let extraData = data.slice((index - Math.abs(this.searchingString.length - data.length)) + this.readUntilStr.length);

//                 // Found readUntilStr, allow the callback to run
//                 let extraBytesCount = this.readUntilStr.length + extraData.length;

//                 // Reset this and feed the extra data back into this function to be printed
//                 this.readUntilStr = undefined;

//                 this.onOutput(extraData);

//                 // Run code for when readUntilString is found
//                 if(this.callback) this.callback(this.accumulatedData, extraBytesCount);
//             }else{
//                 // readUntilStr not found, remove some of the searchingString so it doesn't
//                 // take as long to find the readUntilStr next time, also saves memory
//                 if(this.searchingString.length >= this.readUntilStr.length*2){
//                     this.searchingString = this.searchingString.substring(this.searchingString.length - this.readUntilStr.length);
//                 }
//             }
//         }
//     }
// }

// export { Repl }