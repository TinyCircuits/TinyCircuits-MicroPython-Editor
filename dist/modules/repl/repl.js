import { ReadUntil } from "./read-until.js"

class Repl{
    constructor(){
        // Callback functions that should be tied to other code/modules externally
        this.onOutput = (data) => {};           // Print to console
        this.onWrite = (data, encode) => {};    // Write to serial

        // Make a read until object for processing incoming data
        this.readUntil = new ReadUntil();
    }


    async enterRawPrompt(){
        await this.onWrite("\r\x03\x03");   // Interrupt any running program (https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326)
        await this.onWrite("\r\x01");       // Enter raw mode if not already
    }


    async enterRawPasteMode(){
        await this.onWrite("\r\x03\x03");   // Interrupt any running program (https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326)
        await this.onWrite("\r\x05");       // Enter raw paste mode if not already
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
        await this.enterRawPrompt();

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


    async sendCmd(cmd, encode=true){
        let length = cmd.length != undefined ? cmd.length : cmd.byteLength;

        // See how many chunks of data need to be sent
        let chunkCount = Math.ceil(length/255)+1;

        // Send the chunks one by one
        for(let b=0; b < chunkCount; b++){
            let chunk = cmd.slice(b*255, (b+1)*255);
            this.onWrite(chunk, encode);
        }
    }


    async executeRaw(cmd){
        // Wait for paste mode
        this.readUntil.activate("paste mode; Ctrl-C to cancel, Ctrl-D to finish\r\n=== ", async () => {
            // Wait for exit from paste mode
            this.readUntil.activate(">>>", async (data, extraBytes) => {
                // Once command is done running, wait for soft reboot to clear defined utility code from repl
                this.readUntil.activate("MPY: soft reboot", async () => {
                    // Back at main menu most likely, stop it and get back to normal prompt
                    this.readUntil.activate("Type \"help()\" for more information.\r\n>>>", async () => {
                        this.readUntil.activate("Type \"help()\" for more information.\r\n>>>", async () => {console.log("Done running! Back at normal!")});
                        await this.onWrite("\x02");
                    });

                    // Stop main menu
                    await this.onWrite("\x03\x03");
                });

                // At the end of command run, this will be interpreted and run to soft reset
                await this.onWrite("\x04");
            });

            // Send command in paste mode and exit/finish to run it
            await this.sendCmd(cmd);
            await this.onWrite("\x04");
        });

        // Enter paste mode while waiting
        await this.enterRawPasteMode();
    }


    async getMainMenu(){
        this.readUntil.activate("MPY: soft reboot", async () => {
            this.onOutput("\r\n");
        });
        await this.onWrite("\r\x03\x03");
        await this.onWrite("\r\x04");
    }

    
    async buildPath(path){
        if(this.buildPathScript == undefined) this.buildPathScript = await (await fetch("/dist/py/build_path.py")).text();

        let cmd = this.buildPathScript +
                  "\nbuild(\"" + path + "\")"

        await this.executeRaw(cmd);
    }


    // Defines build and save functions and then allows saving through use of the JS save function here
    async startSaveFileMode(callback){
        if(this.busy) return;
        this.busy = true;

        if(this.buildPathScript == undefined) this.buildPathScript = await (await fetch("/dist/py/build_path.py")).text();
        if(this.saveFileScript == undefined) this.saveFileScript = await (await fetch("/dist/py/save_file.py")).text();

        this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
            this.readUntil.activate(">", async () => {
                this.busy = false;
                callback();
            });
            // Send command in paste mode and exit/finish to run it
            await this.sendCmd(this.buildPathScript + this.saveFileScript);
            await this.onWrite("\x04");
        });
        await this.enterRawPrompt();
    }

    async saveFile(filePath, data, callback){
        if(this.busy) return;
        this.busy = true;

        // Check the type and convert to Uint8Array if not already
        let typeStr = Object.prototype.toString.call(data);
        if(typeStr == "[object String]"){
            let dataCopy = data;
            data = new Uint8Array(data.length);
            for(let icx=0; icx<data.length; icx++){
                data[icx] = dataCopy.charCodeAt(icx);
            }
        }if(typeStr == "[object ArrayBuffer]"){
            data = new Uint8Array(data);
        }

        
        this.readUntil.activate(">", async () => {
            this.readUntil.activate("READY_TO_SAVE", async () => {
                this.readUntil.activate(">", async () => {
                    this.busy = false;
                    callback();
                });

                if(data.length > 0){
                    // Send data 255 bytes at a time to always fill the buffer
                    let chunkCount = Math.ceil(data.length/255)+1;
                    for(let b=0; b < chunkCount; b++){
                        let chunk = data.slice(b*255, (b+1)*255);
                        await this.onWrite(chunk, false);

                        if(chunk.length < 255){
                            await this.onWrite(new Uint8Array(255 - chunk.length), false);
                            break;
                        }
                    }
                }
            });
            await this.sendCmd("start_save(\"" + filePath + "\"," + data.length + ")\r");
            await this.sendCmd("\x04");
        });
        await this.sendCmd("build(\"" + filePath.slice(0, filePath.lastIndexOf("/")) + "\")");
        await this.sendCmd("\x04");
    }

    async endSaveFileMode(){
        if(this.busy) return;
        this.busy = true;

        this.readUntil.activate("Type \"help()\" for more information.\r\n>>>", async () => {
            // Once command is done running, wait for soft reboot to clear defined utility code from repl
            this.readUntil.activate("MPY: soft reboot", async () => {
                this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
                    this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
                        this.readUntil.activate("Type \"help()\" for more information.\r\n>>>", async () => {
                            this.busy = false;
                        });
                        await this.onWrite("\r\x02");     // Get a normal/friendly prompt
                    });
                    await this.onWrite("\x04");         // Soft reset/exit raw mode
                });
                await this.enterRawPrompt();
            });

            // At the end of command run, this will be interpreted and run to soft reset
            await this.onWrite("\x04");
        });
        this.sendCmd("\r\x02");
    }
}

export { Repl }