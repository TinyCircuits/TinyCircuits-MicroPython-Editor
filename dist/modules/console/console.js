class Console{
    constructor(consoleDiv, message){
        this.consoleDiv = consoleDiv;
        this.consoleDiv.style.display = "grid";

        this.console = new Terminal({fontWeight: 500});
        this.console.open(this.consoleDiv);

        // Load the fit addon so the console always fills its div
        this.consoleFitAddon = new FitAddon.FitAddon();
        this.console.loadAddon(this.consoleFitAddon);
        this.consoleFitAddon.fit();

        // Resize console when containing parent div is resized
        new ResizeObserver(() => {
            this.#fit();
        }).observe(this.consoleDiv);


        // Function to be defined and used externally but called internally
        this.onType = (data) => {};


        // Set the terminal background to the page background color
        this.console.setOption('theme', {
            background: getComputedStyle(consoleDiv).backgroundColor,
            cursor: getComputedStyle(consoleDiv).color,
            foreground: getComputedStyle(consoleDiv).color
        });


        this.console.onData((data) => {
            if(data == ''){
                throw "Paste (uncaught on purpose for paste, workaround)";
            }else{
                this.onType(data);
            }
        })

        if(message != undefined){
            this.write(message);
        }
    }


    write(str){
        this.console.write(str);
    }


    // Fit emulator and hardware Consoles to their parents
    #fit(){
        this.consoleFitAddon.fit();
    }
}

export { Console }