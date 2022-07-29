class SpriteTabCanvas{
    constructor(filePath, divEditorMainID){
        this.divEditorMain = document.getElementById(divEditorMainID);

        this.divCanvasParent = document.createElement("div");
        this.divCanvasParent.classList = "absolute top-0 left-0 bottom-0 right-0 bg-gray-50";
        this.divEditorMain.appendChild(this.divCanvasParent);

        // A file path is stored so this module can use local storage
        this.filePath = filePath;

        // The canvas all the drawing is done on
        this.canvas = document.createElement("canvas");
        this.canvas.classList = "crisp-canvas border border-gray border-dashed absolute top-[0px] left-[0px]";

        // Setup default dimensions
        this.canvas.style.width = "72px";
        this.canvas.style.height = "40px";
        this.canvas.width = 72;
        this.canvas.height = 40;

        // Get the context for drawing and disable any smoothing
        this.context = this.canvas.getContext('2d', { alpha: false });
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.oImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        // Add the canvas to the canvas parent div
        this.divCanvasParent.appendChild(this.canvas);

        // Make sure it is centered
        this.#centerCanvas();

        // When the div containing the canvas is resized, ensure
        // the canvas doesn't go too far out of bounds
        this.resizeObserver = new ResizeObserver(() => {
            this.#keepCanvasInbounds();
        }).observe(this.divCanvasParent);

        // Hide by default, the currently selected sprite editor tab will auto show
        this.hide();

        // Setup panning/translating canvas event
        this.#setupPanning();
    }


    #setupPanning(){
        // On mouse down start panning
        this.divCanvasParent.onmousedown = (event) => {
            if(this.shown){
                this.panning = true;
                this.divCanvasParent.style.cursor = "grab";
            }
        }

        // On mouse up stop panning
        document.addEventListener("mouseup", (event) => {
            if(this.shown){
                this.panning = false;
                this.divCanvasParent.style.cursor = "default";
            }
        });

        // On mouse move if started panning, pan
        document.addEventListener("mousemove", (event) => {
            if(this.shown){
                // When the mouse moves and event.buttons == 4, pan the canvas around
                // Set the cursor to indicate pan action is enabled
                if(event.buttons == 4 && this.panning){
                    let newCanvasDOMLeft = parseInt(this.canvas.style.left) + event.movementX;
                    let newCanvasDOMTop = parseInt(this.canvas.style.top) + event.movementY;
    
                    // Set new position
                    this.canvas.style.left = newCanvasDOMLeft + "px";
                    this.canvas.style.top = newCanvasDOMTop + "px";

                    // Make sure it is still in bounds
                    this.#keepCanvasInbounds();
                }
            }
        });
    }


    // Centers drawing canvas in center of parent based on client dimensions and not just css values
    #centerCanvas(){
        let parentDOMWidth = this.divCanvasParent.clientWidth;
        let parentDOMHeight = this.divCanvasParent.clientHeight;

        let canvasDOMWidth = this.canvas.clientWidth;
        let canvasDOMHeight = this.canvas.clientHeight;

        this.canvas.style.left = ((parentDOMWidth/2) - (canvasDOMWidth/2)) + "px";
        this.canvas.style.top = ((parentDOMHeight/2) - (canvasDOMHeight/2)) + "px";
    }


    // If the canvas goes out of bounds of the editor
    // viewport, make sure it gets stuck inbounds
    #keepCanvasInbounds(){
        let parentDOMWidth = this.divCanvasParent.clientWidth;
        let parentDOMHeight = this.divCanvasParent.clientHeight;
        let canvasDOMWidth = parseInt(this.canvas.style.width);
        let canvasDOMHeight = parseInt(this.canvas.style.height);
        let canvasDOMLeft = parseInt(this.canvas.style.left);
        let canvasDOMTop = parseInt(this.canvas.style.top);

        if(canvasDOMLeft+canvasDOMWidth < 0){
            this.canvas.style.left = -(canvasDOMWidth-2) + "px";
        }else if(canvasDOMLeft > parentDOMWidth){
            this.canvas.style.left = parentDOMWidth-2 + "px";
        }

        if(canvasDOMTop+canvasDOMHeight < 0){
            this.canvas.style.top = -(canvasDOMHeight-2) + "px";
        }else if(canvasDOMTop > parentDOMHeight){
            this.canvas.style.top = parentDOMHeight-2 + "px";
        }
    }


    hide(){
        console.warn("Hidden", this.filePath);
        this.shown = false;
        this.divCanvasParent.classList.add("invisible");
    }


    show(){
        console.warn("Shown", this.filePath);
        this.shown = true;
        this.divCanvasParent.classList.remove("invisible");
    }
}

export { SpriteTabCanvas }