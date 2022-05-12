class Console{
    constructor(consoleDiv){
        this.consoleDiv = consoleDiv;
        this.consoleDiv.style.display = "grid";

        this.console = new Terminal();
        this.console.open(this.consoleDiv);



        this.consoleFitAddon = new FitAddon.FitAddon();

        this.console.loadAddon(this.consoleFitAddon);

        this.consoleFitAddon.fit();


        // Set the terminal background to the page background color
        this.console.setOption('theme', {
            background: '#ffffff',
            cursor: "#000000",
            foreground: "#000000"
        });


        this.console.onData((typed) => {
            if(typed == ''){
                throw "Paste (uncaught on purpose for paste, workaround)";
            }else{
                // this.emulatorTyped(typed);
            }
        })
    }


    write(str){
        this.console.write(str);
    }


    // Fit emulator and hardware Consoles to their parents
    #fit(){
        this.consoleFitAddon.#fit();
    }
}

export { Console }