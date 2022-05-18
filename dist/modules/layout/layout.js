class Layout{
    constructor(layoutDiv){
        this.layoutDiv = layoutDiv;

        document.getElementById("main").style.width = this.layoutDiv.clientWidth + "px";
        document.getElementById("main").style.height = this.layoutDiv.clientHeight + "px";

        
        // Default layout panel sizes
        this.sizes = {
            "win1" : 0.85,
            "win3" : 0.175,
            "win5" : 0.75
        };


        // Try to restore layout from localstorage
        let savedLayoutSizes = localStorage.getItem("LayoutSizes");
        if(savedLayoutSizes != null){
            Resizable.initialise("main", JSON.parse(savedLayoutSizes), 2);
        }else{
            Resizable.initialise("main", this.sizes, 2);
        }
        

        // Resize panels when the browser window size changes
        window.addEventListener("resize", () => {
           this.#resize();
        });

        Resizable.windowResized = () => {
            
        }

        Resizable.resizingStarted = () => {

        }

        Resizable.resizingEnded = () => {
            this.saveLayout();
        }

        this.#resize();
    }


    #resize(){
        Resizable.activeContentWindows[0].changeSize(this.layoutDiv.clientWidth, this.layoutDiv.clientHeight);
        Resizable.activeContentWindows[0].childrenResize();
    }


    // Save layout to local storage
    saveLayout(){
        let tempLayoutSizes = {};
        this.storeLayoutSizes(Resizable.activeContentWindows[0], tempLayoutSizes);
        localStorage.setItem("LayoutSizes", JSON.stringify(tempLayoutSizes))
    }


    // Recursively collect sizes of each panel and store in temp variable
    storeLayoutSizes(contentWindow, tempLayoutSizes){
        for(let i=0; i<contentWindow.children.length; i++){
            tempLayoutSizes[contentWindow.children[i].divId] = contentWindow.children[i].sizeFractionOfParent;
            this.storeLayoutSizes(contentWindow.children[i], tempLayoutSizes);
        }
    }


    resetLayoutSize(){
        Resizable.initialise("main", this.sizes, 2);
        this.#resize();
        this.saveLayout();
    }
}

export { Layout }