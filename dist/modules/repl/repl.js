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
        await this.sendCmd("\r\x03\x03");   // Interrupt any running program (https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326)
        await this.sendCmd("\r\x01");       // Enter raw mode if not already
    }


    async enterRawPasteMode(){
        await this.sendCmd("\r\x03\x03");   // Interrupt any running program (https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326)
        await this.sendCmd("\r\x05");       // Enter raw paste mode if not already
    }


    // Called when serial connects to a device
    async connected(){
        return new Promise(async (resolve) => {
            this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
                this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
                    await this.sendCmd("\r\x02");     // Get a normal/friendly prompt
                    resolve();
                });
                await this.sendCmd("\x04");         // Soft reset/exit raw mode
            });
            await this.enterRawPrompt();
        });
    }


    // Main data consumer, data comes here from serial before being output again
    consumeData(data){
        if(!this.readUntil.isActive || this.readUntil.forceOutput == true){
            this.onOutput(data);
        }

        if(this.readUntil.isActive){
            this.readUntil.evaluate(data);
        }

        console.log(new TextDecoder().decode(data));
    }


    async sendCmd(cmd, encode=true){
        let length = cmd.length != undefined ? cmd.length : cmd.byteLength;

        // See how many chunks of data need to be sent
        let chunkCount = Math.ceil(length/255)+1;

        // Send the chunks one by one
        for(let b=0; b < chunkCount; b++){
            let chunk = cmd.slice(b*255, (b+1)*255);
            await this.onWrite(chunk, encode);
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
                        await this.sendCmd("\r\x02");
                    });

                    // Stop main menu
                    await this.sendCmd("\r\x03\x03");
                });

                // At the end of command run, this will be interpreted and run to soft reset
                await this.sendCmd("\x04");
            });

            // Send command in paste mode and exit/finish to run it
            await this.sendCmd(cmd);
            await this.sendCmd("\x04");
        });

        // Enter paste mode while waiting
        await this.enterRawPasteMode();
    }


    async getMainMenu(){
        this.readUntil.activate("MPY: soft reboot", async () => {
            this.onOutput("\r\n");
        });
        await this.sendCmd("\r\x03\x03");
        await this.sendCmd("\x04");
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
            await this.sendCmd("\x04");
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
                            await this.onWrite(new Uint8Array(255 - (chunk.length)), false);
                            break;
                        }
                    }
                }
            });
            await this.sendCmd("start_save(\"" + filePath + "\"," + data.length + ")");
            await this.sendCmd("\x04");
        });
        await this.sendCmd("build(\"" + filePath.slice(0, filePath.lastIndexOf("/")) + "\")");
        await this.sendCmd("\x04");
    }

    async endSaveFileMode(callback = () => {}){
        if(this.busy) return;
        this.busy = true;

        this.readUntil.activate("Type \"help()\" for more information.\r\n>>>", async () => {
            // Once command is done running, wait for soft reset and reboot to clear defined utility code from repl ('] comes from end of main menu output)
            this.readUntil.activate("MPY: soft reboot", async () => {
                this.readUntil.activate("Type \"help()\" for more information.\r\n>>> ", async () => {
                    this.busy = false;
                    callback();
                });
                await this.sendCmd("\x03");
            });

            // At the end of command run, this will be interpreted and run to soft reset
            await this.sendCmd("\x04");
        });
        await this.sendCmd("\r\x02");
    }


    async executeFile(filePath){
        this.readUntil.activate("execfile(\"" + filePath + "\")\r\n", async (finalData, extraData) => {
            // Output the extra data that was used during the finding of the activate line
            await this.onOutput(extraData);
        });
        await this.onOutput("\r\n");
        await this.sendCmd("from machine import freq\r\n");
        await this.sendCmd("freq(125000000)\r\n");
        await this.sendCmd("execfile(\"" + filePath + "\")\r\n");
        window.loadStop("Started!", 0);
    }

    async stop(){
        await this.sendCmd("\r\x03\x03");
        window.load(100, "Stopping...");
        window.loadStop("Stopped!", 100);
    }
}

export { Repl }