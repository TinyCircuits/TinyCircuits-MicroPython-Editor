import { Frame } from "./frame.js";

class SpriteTabCanvas{
    constructor(filePath, spriteData, divEditorMainID, divSpriteFrameListMainID, saveCallback){
        // A file path is stored so this module can use local storage
        this.filePath = filePath;

        this.saveCallback = saveCallback;

        if(this.spriteData == undefined){
            this.#initSpriteData();
        }else{
            this.spriteData = spriteData;
        }


        // Grab some parent elements
        this.divEditorMain = document.getElementById(divEditorMainID);
        this.divSpriteFrameListMain = document.getElementById(divSpriteFrameListMainID);

        // Setup frame list and drawing canvas (frame list dictates what is shown on the drawing canvas)
        this.#setupFrameList();
        // this.#setupDrawingCanvas();
    }


    // Write data to teh sprite file for the first time
    // Tab data is a file in the following format (per-byte) (otherwise activate importer/converter legacy tool if start string not found)
    // TINYCIRCUITS_SPRITE_FORMAT_V001                       (always 31 bytes)
    // FRAME_COUNT_BYTE FRAME_WIDTH_BYTE FRAME_HEIGHT_BYTE   (always 3 bytes)
    // VLSB_DATA ...                                         (FRAME_COUNT * FRAME_WIDTH * FRAME_HEIGHT // 8 bytes)
    #initSpriteData(){
        let data = new Uint8Array(31 + 3 + ((72*40) / 8));
        data.set(new TextEncoder().encode("TINYCIRCUITS_SPRITE_FORMAT_V001"), 0);   // Header
        data[31] = 1;                                                               // Frame count
        data[32] = 72;                                                              // Frame width
        data[33] = 40;                                                              // Frame height
        data.set(new Uint8Array((72*40)/8));                                        // Blank frame
        this.spriteData = data;

        this.saveCallback(this.spriteData);
    }


    // Add frame behind the leading element (typically the add frame button)
    #addFrame(leadingElement){
        let newFrame = new Frame(leadingElement, this.frameList.length, 72, 40);
        this.frameList.push(newFrame);
    }


    #setupFrameList(){
        // Setup frame list
        this.divFrameListParent = document.createElement("div");
        this.divFrameListParent.classList = "absolute top-0 left-3 bottom-0 right-3 flex flex-col items-center";
        this.divSpriteFrameListMain.appendChild(this.divFrameListParent);

        this.frameList = [];

        this.btnAddFrame = document.createElement("button");
        this.btnAddFrame.classList = "btn rounded-full min-w-[32px] min-h-[32px] border border-black mt-3 flex items-center justify-center"
        this.btnAddFrame.innerHTML = 
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        `
        this.btnAddFrame.onclick = (event) => {this.#addFrame(this.btnAddFrame)};
        this.divFrameListParent.appendChild(this.btnAddFrame);
    }


    #setupDrawingCanvas(){
        // Setup drawing canvas
        this.divCanvasParent = document.createElement("div");
        this.divCanvasParent.classList = "absolute top-0 left-0 bottom-0 right-0 bg-gray-50";
        this.divEditorMain.appendChild(this.divCanvasParent);

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

        // Setup mouse zooming
        this.#setupZooming();
    }


    #setupPanning(){
        // On mouse down start panning
        this.divCanvasParent.onmousedown = (event) => {
            if(this.shown && event.buttons == 4){
                this.panning = true;
                this.divCanvasParent.style.cursor = "grab";
            }
        }

        // On mouse up stop panning
        document.addEventListener("mouseup", (event) => {
            this.panning = false;
            this.divCanvasParent.style.cursor = "default";
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


    #setupZooming(){
        // Zoom the canvas in and out based on cursor and current location using scroll wheel
        this.divCanvasParent.onwheel = (event) => {
            event.preventDefault();

            let canvasDOMWidth = parseFloat(this.canvas.style.width);
            let canvasDOMHeight = parseFloat(this.canvas.style.height);

            let newCanvasDOMWidth = undefined;
            let newCanvasDOMHeight = undefined;

            if(event.deltaY < 0){
                newCanvasDOMWidth = canvasDOMWidth * 1.25;
            }else if(event.deltaY > 0){
                newCanvasDOMWidth = canvasDOMWidth / 1.25;
            }
            newCanvasDOMHeight = newCanvasDOMWidth / (canvasDOMWidth/canvasDOMHeight);

            this.canvas.style.width = newCanvasDOMWidth + "px";
            this.canvas.style.height = newCanvasDOMHeight + "px";

            // Offset scale to center of canvas
            let x = parseFloat(this.canvas.style.left);
            let y = parseFloat(this.canvas.style.top);

            let pdx = (newCanvasDOMWidth - canvasDOMWidth)/2;
            let pdy = (newCanvasDOMHeight - canvasDOMHeight)/2;

            this.canvas.style.left = (x - pdx) + "px";
            this.canvas.style.top = (y - pdy) + "px";

            // Make sure it is still in bounds
            this.#keepCanvasInbounds();
        }
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
        this.shown = false;
        if(this.divCanvasParent != undefined){
            this.divFrameListParent.style.display = "none";
            this.divCanvasParent.classList.add("invisible");
        }
    }


    show(){
        this.shown = true;
        if(this.divCanvasParent != undefined){
            this.divFrameListParent.style.display = "flex";
            this.divCanvasParent.classList.remove("invisible");
        }
    }
}

export { SpriteTabCanvas }