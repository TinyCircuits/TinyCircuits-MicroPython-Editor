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
        await this.onWrite("\x03\x03");   // Interrupt any running program (https://github.com/micropython/micropython/blob/master/tools/pyboard.py#L326)
        await this.onWrite("\x01");       // Enter raw mode if not already
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


    async test(){
        // let file = await (await fetch("/dist/py/file_downloader.py")).arrayBuffer();
        // console.log(file);

        this.readUntil.activate("raw REPL; CTRL-B to exit\r\n>", async () => {
            this.readUntil.activate(">", async (data, extraBytes) => {
                console.log(new TextDecoder().decode(data));

                // Just want to hide these characters so as not to duplicate
                this.readUntil.activate("Type \"help()\" for more information.\r\n>>>", async () => {});
                await this.onWrite("\x02");     // Get a normal/friendly prompt
            });
            this.onWrite("print(\"TEST\")");
            this.onWrite("\x04");
        });
        await this.enterRawPrompt();
    }
}

export { Repl }