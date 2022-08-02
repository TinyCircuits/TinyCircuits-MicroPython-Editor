import { Frame } from "./frame.js";

class SpriteTabCanvas{
    constructor(filePath, spriteData, divEditorMainID, divSpriteFrameListMainID, saveCallback){
        // A file path is stored so this module can use local storage
        this.filePath = filePath;

        this.saveCallback = saveCallback;


        if(spriteData == undefined){
            this.#initSpriteData();
        }else{
            this.spriteData = spriteData;
        }


        // Grab some parent elements
        this.divEditorMain = document.getElementById(divEditorMainID);
        this.divSpriteFrameListMain = document.getElementById(divSpriteFrameListMainID);

        // Setup frame list and drawing canvas (frame list dictates what is shown on the drawing canvas)
        this.#setupFrameList();
    }


    // Write data to the sprite file for the first time
    // Tab data is a file in the following format (per-byte) (otherwise activate importer/converter legacy tool if start string not found)
    // TC_SPR_FMT_001                                        (always 14 bytes)
    // FRAME_COUNT_BYTE FRAME_WIDTH_BYTE FRAME_HEIGHT_BYTE   (always 3 bytes)
    // VLSB_DATA ...                                         (FRAME_COUNT * FRAME_WIDTH * FRAME_HEIGHT // 8 bytes)
    #initSpriteData(){
        let data = new Uint8Array(14 + 3 + Math.floor((72*40) / 8));
        data.set(new TextEncoder().encode("TC_SPR_FMT_V001"), 0);   // Header
        data[14] = 1;                                               // Frame count
        data[15] = 72;                                              // Frame width
        data[16] = 40;                                              // Frame height
        data.set(new Uint8Array((72*40)/8), 17);                    // Blank frame
        this.spriteData = data;

        this.saveCallback(this.spriteData);
    }


    // Get the VLSB frame length using width and height from the file
    #getFrameLength(){
        let frameByteLength = this.spriteData[15]*Math.floor(this.spriteData[16]/8);
        if(this.spriteData[16]%8) frameByteLength += this.spriteData[15];
        return frameByteLength;
    }


    // Return width and height of the current sprite from the file data
    #getFrameWidthHeight(){
        let frameWidth = this.spriteData[15];
        let frameHeight = this.spriteData[16];
        return [frameWidth, frameHeight];
    }


    // Add a new blank frame to the data (this new data will be added on
    // and the file saved)
    #addFrameToData(){
        if(this.spriteData[14] + 1 <= 255){
            this.spriteData[14] = this.spriteData[14] + 1;

            const frameByteLength = this.#getFrameLength();

            let newSpriteData = new Uint8Array(this.spriteData.length + frameByteLength);
            newSpriteData.set(this.spriteData);
            this.spriteData = newSpriteData;

            this.#updateFrameList();

            this.saveCallback(this.spriteData);
        }else{
            window.showError("Reached sprite frame limit of 256 frames, cannot add anymore");
        }
    }


    // Function called by frame class to open a frame at the current index (index in children of parent element for frame list)
    #openFrameAtIndex(frameCanvas, frameContext, frameIndex){
        if(this.canvas == undefined){
            this.#setupDrawingCanvas();
        }

        // Copy over the frame canvas tot he drawing canvas which will in turn feed
        // back to the frame and be formatted into VLSB when drawn ona nd then saved
        this.context.drawImage(frameCanvas, 0, 0);

        // Store the context of the current frame
        this.frameContext = frameContext;

        // The index of the current frame (changes when frames are moved or deleted)
        this.frameIndex = frameIndex;
    }


    // Add frame behind the leading element (typically the add frame button)
    #addFrameToList(frameIndex){
        const [ frameWidth, frameHeight ] = this.#getFrameWidthHeight();
        const frameByteLength = this.#getFrameLength();

        let frameByteOffset = 17 + (frameByteLength * frameIndex);
        let frameData = this.spriteData.slice(frameByteOffset, frameByteOffset + frameByteLength);

        let newFrame = new Frame(this.btnAddFrame, frameWidth, frameHeight, this.#openFrameAtIndex.bind(this));
        newFrame.update(frameData);
    }


    // Remove all frame elements and add them back again (might get too expensive since need to recreate all canvases again...)
    #updateFrameList(){
        // Remove all frame elements from frame list
        while(this.divFrameListParent.children.length > 1){
            this.divFrameListParent.removeChild(this.divFrameListParent.children[0]);
        }

        let frameCount = this.spriteData[14];

        for(let ifx=0; ifx<frameCount; ifx++){
            this.#addFrameToList(ifx);
        }
    }


    // Setup parent inside editor frame element and add the button to add more frames
    #setupFrameList(){
        // Setup frame list
        this.divFrameListParent = document.createElement("div");
        this.divFrameListParent.classList = "absolute top-0 left-3 bottom-0 right-3 flex flex-col items-center";
        this.divSpriteFrameListMain.appendChild(this.divFrameListParent);

        this.btnAddFrame = document.createElement("button");
        this.btnAddFrame.classList = "btn rounded-full min-w-[32px] min-h-[32px] border border-black mt-3 flex items-center justify-center"
        this.btnAddFrame.innerHTML = 
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        `
        this.btnAddFrame.onclick = (event) => {this.#addFrameToData(this.btnAddFrame)};
        this.divFrameListParent.appendChild(this.btnAddFrame);

        this.#updateFrameList();
    }


    // Each sprite file editor gets a canvas for drawing to. Selected frames get copied to this,
    // and edits get fed back into the frame and saved in VLSB to the sprite file on every edit
    #setupDrawingCanvas(){
        // Setup drawing canvas
        this.divCanvasParent = document.createElement("div");
        this.divCanvasParent.classList = "absolute top-0 left-0 bottom-0 right-0 bg-gray-50";
        this.divEditorMain.appendChild(this.divCanvasParent);

        // The canvas all the drawing is done on
        this.canvas = document.createElement("canvas");
        this.canvas.classList = "crisp-canvas border border-gray border-dashed absolute top-[0px] left-[0px]";

        const [ frameWidth, frameHeight ] = this.#getFrameWidthHeight();

        // Setup default dimensions
        this.canvas.style.width = frameWidth + "px";
        this.canvas.style.height = frameHeight + "px";
        this.canvas.width = frameWidth;
        this.canvas.height = frameHeight;

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

        // Setup panning/translating canvas event
        this.#setupPanning();

        // Setup mouse zooming
        this.#setupZooming();

        // Setup hover and draw functions
        this.#setupDrawing();
    }


    #getCanvasXY(){
        const bb = this.canvas.getBoundingClientRect();
        const x = Math.floor( (event.clientX - bb.left) / bb.width * this.canvas.width );
        const y = Math.floor( (event.clientY - bb.top) / bb.height * this.canvas.height );
        return [x, y];
    }


    #updateSpriteFrame(){
        // Quickly show the edits
        this.frameContext.drawImage(this.canvas, 0, 0);

        const [ frameWidth, frameHeight ] = this.#getFrameWidthHeight();
        const frameByteLength = this.#getFrameLength();

        let frame = new Uint8Array(frameByteLength);

        // Update the frame in the file
        let imageData = this.context.getImageData(0, 0, frameWidth, frameHeight).data;

        let ib = 0;
        for(let row=0; row < frameHeight; row+=8){
            for(let col=0; col < frameWidth; col++){
                frame[ib] = 0b00000000;
                for(let i=0; i<8; i++){
                    const x = col;
                    const y = row + i;
                    const p = (y * frameWidth + x) * 4;
                    
                    if(imageData[p] == 255){
                        frame[ib] = frame[ib] | 1 << i;
                    }
                }
                ib += 1;
            }
        }

        let frameByteOffset = frameByteLength * this.frameIndex;
        this.spriteData.set(frame, 17 + frameByteOffset);
        this.saveCallback(this.spriteData);
    }


    #setupDrawing(){
        this.canvas.onmousemove = (event) => {
            const [x, y] = this.#getCanvasXY();

            // Clear the last drawn gray pixel if it exists
            if(this.lastColor != undefined){
                if(this.lastColor[0] == 255){
                    this.context.fillStyle = "white";
                }else{
                    this.context.fillStyle = "black";
                }
                this.context.beginPath();
                this.context.fillRect(this.lastX, this.lastY, 1, 1);
                this.context.stroke();
            }

            // Before drawing the gray pixel, get the color under it
            this.lastColor = this.context.getImageData(x, y, 1, 1).data;

            // Draw the gray/selected pixel
            this.context.beginPath();
            this.context.fillStyle = "gray";
            this.context.fillRect(x, y, 1, 1);
            this.context.stroke();

            if(event.buttons == 1){
                this.context.beginPath();
                this.context.fillStyle = "white";
                this.context.fillRect(x, y, 1, 1);
                this.context.stroke();

                this.lastColor = this.context.getImageData(x, y, 1, 1).data;
                this.#updateSpriteFrame();
            }

            this.lastX = x;
            this.lastY = y;
        }
        this.canvas.onmousedown = (event) => {
            const [x, y] = this.#getCanvasXY();

            if(event.buttons == 1){
                this.context.beginPath();
                this.context.fillStyle = "white";
                this.context.fillRect(x, y, 1, 1);
                this.context.stroke();
                this.lastColor = this.context.getImageData(x, y, 1, 1).data;

                this.#updateSpriteFrame();
            }

            this.frameContext.drawImage(this.canvas, 0, 0);
            this.lastX = x;
            this.lastY = y;
        }
        this.canvas.onmouseleave = (event) => {
            // Clear the last drawn gray pixel if it exists
            if(this.lastColor != undefined){
                if(this.lastColor[0] == 255){
                    this.context.fillStyle = "white";
                }else{
                    this.context.fillStyle = "black";
                }
                this.context.beginPath();
                this.context.fillRect(this.lastX, this.lastY, 1, 1);
                this.context.stroke();
            }
        }
    }


    // Middle mouse button allows panning
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


    // Scroll wheel allows zooming
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


    // Can drawing canvas and frame list
    hide(){
        this.shown = false;
        this.divFrameListParent.style.display = "none";

        if(this.divCanvasParent != undefined){
            this.divCanvasParent.classList.add("invisible");
        }
    }


    // Show drawing canvas and frame list
    show(){
        this.shown = true;
        this.divFrameListParent.style.display = "flex";

        if(this.divCanvasParent != undefined){
            this.divCanvasParent.classList.remove("invisible");
        }
    }
}

export { SpriteTabCanvas }