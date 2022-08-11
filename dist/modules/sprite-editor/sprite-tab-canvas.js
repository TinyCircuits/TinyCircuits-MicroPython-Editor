import { Frame } from "./frame.js";

class SpriteTabCanvas{
    constructor(filePath, spriteData, divEditorMainID, divSpriteFrameListMainID, saveCallback, spriteAnimationPreview){
        // A file path is stored so this module can use local storage
        this.filePath = filePath;

        this.saveCallback = saveCallback;
        this.spriteAnimationPreview = spriteAnimationPreview;

        if(spriteData == undefined){
            this.#initSpriteData();
        }else{
            this.spriteData = spriteData;
        }

        // Grab some parent elements
        this.divEditorMain = document.getElementById(divEditorMainID);
        this.divSpriteFrameListMain = document.getElementById(divSpriteFrameListMainID);

        this.listenerZoomIn = () => {if(this.shown) this.#zoom(1.25);};
        this.listenerZoomOut = () => {if(this.shown) this.#zoom(1 / 1.25);};
        this.listenerFitCanvas = () => {if(this.shown){ this.#centerCanvas(); localStorage.setItem("SpriteEditorCanvasDimensionsPosition" + this.filePath, JSON.stringify([this.canvas.style.width, this.canvas.style.height, this.canvas.style.left, this.canvas.style.top]));}};
        document.getElementById("btnSpriteEditorZoomIn").addEventListener("click", this.listenerZoomIn);
        document.getElementById("btnSpriteEditorZoomOut").addEventListener("click", this.listenerZoomOut);
        document.getElementById("btnSpriteEditorFitCanvas").addEventListener("click", this.listenerFitCanvas);
        
        this.checkboxSpriteEditorFilled = document.getElementById("checkboxSpriteEditorFilled");

        this.btnSpriteEditorBrushTool = document.getElementById("btnSpriteEditorBrushTool");
        this.btnSpriteEditorRectangle = document.getElementById("btnSpriteEditorRectangle");
        this.btnSpriteEditorOval = document.getElementById("btnSpriteEditorOval");
        this.btnSpriteEditorLine = document.getElementById("btnSpriteEditorLine");
        this.btnSpriteEditorBucket = document.getElementById("btnSpriteEditorBucket");
        this.btnSpriteEditorBlack = document.getElementById("btnSpriteEditorBlack");
        this.btnSpriteEditorWhite = document.getElementById("btnSpriteEditorWhite");
        this.btnSpriteEditorResize = document.getElementById("btnSpriteEditorResize");
        this.btnSpriteEditorResizeConfirm = document.getElementById("btnSpriteEditorResizeConfirm");

        this.btnSpriteEditorBrushTool.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorRectangle.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorOval.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorLine.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorBucket.addEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorBlack.addEventListener("click", this.#updateColorStates.bind(this));
        this.btnSpriteEditorWhite.addEventListener("click", this.#updateColorStates.bind(this));
        this.btnSpriteEditorResize.addEventListener("click", this.#fillResizePrompt.bind(this));
        this.btnSpriteEditorResizeConfirm.addEventListener("click", this.#resizeFrames.bind(this));

        // Setup frame list and drawing canvas (frame list dictates what is shown on the drawing canvas)
        this.#setupFrameList();
    }


    #resizeFrames(newWidth, newHeight){
        // If the width or height are undefined, must have been called
        // from resize confirm, grab those values instead (see code.html)
        if(newWidth == undefined || newHeight == undefined){
            newWidth = parseInt(document.getElementById("inputModalSpriteEditorWidth").value);
            newHeight = parseInt(document.getElementById("inputModalSpriteEditorHeight").value);
        }
        
        // Grab the old frame width and height
        const [ oldWidth, oldHeight ] = this.#getFrameWidthHeight();
        const oldFrameByteLength = this.#getFrameLength();

        // Set the new width and height in what is now the old data
        this.spriteData[15] = newWidth;
        this.spriteData[16] = newHeight;

        // Calculate the new spriteData size since the frame size changed
        const frameCount = this.spriteData[14];
        const newFrameByteLength = this.#getFrameLength();  // Set the width and height above, this will be in terms of the new size
        const newSize = 17 + (newFrameByteLength * frameCount);

        // Make the new sprite data array and copy over initial non-frame data (width and height was already set in old data array)
        let newSpriteData = new Uint8Array(newSize);
        newSpriteData.set(this.spriteData.slice(0, 17), 0);

        // Loop through each frame in the old data, trim
        // or expand with black, and copy to new data array
        for(let ifx=0; ifx<frameCount; ifx++){
            let newFrameByteOffset = 17 + (newFrameByteLength * ifx);
            let oldFrameByteOffset = 17 + (oldFrameByteLength * ifx);

            // For each row, loop through each column and just copy
            // icx < oldWidth. newHeight is in terms of pixels
            // when in fact each byte is 8 vertical pixels (VLSB),
            // so skip by 8 for each row index
            for(let irx=0; irx<oldHeight; irx+=8){
                // For each column of 8 pixels in each row
                for(let icx=0; icx<oldWidth; icx++){
                    // This is the index into the new sprite data
                    let newSpriteDataIndex = icx + newWidth + (irx/8);
                    let oldSpriteDataIndex = icx + oldWidth + (irx/8);
                    
                    let oldSpriteDataByte = this.spriteData[oldFrameByteOffset + oldSpriteDataIndex];

                    // // If on the last row and some of the pixels/bits in these last row bytes
                    // // exceed the dimensions of the frame, make them black too
                    // if(irx+8 >= newHeight){
                    //     // Figure out vertical start and end bit indices

                    // }

                    newSpriteData[newFrameByteOffset + newSpriteDataIndex] = oldSpriteDataByte;
                }
            }
        }

        this.spriteData = newSpriteData;
        this.#updateFrameList();
    }


    // Get input elements in prompt defined in code.html and fill in values
    #fillResizePrompt(event){
        const [ frameWidth, frameHeight ] = this.#getFrameWidthHeight();
        document.getElementById("inputModalSpriteEditorWidth").value = frameWidth;
        document.getElementById("inputModalSpriteEditorHeight").value = frameHeight;
    }


    #toolFocusReplace(element){
        element.classList.replace("btn-primary-focus", "btn-primary");
        element.classList.remove("border");
        element.classList.remove("border-primary-focus");
    }

    #toolFocusToggle(element){
        element.classList.toggle("btn-primary-focus");
        element.classList.toggle("btn-primary");
        element.classList.toggle("border");
        element.classList.toggle("border-primary-focus");
    }

    // Keep track of which tool is toggle for this drawing canvas in relation to global element button presses
    #updateToolState(event){
        this.#toolFocusReplace(this.btnSpriteEditorBrushTool);
        this.#toolFocusReplace(this.btnSpriteEditorRectangle);
        this.#toolFocusReplace(this.btnSpriteEditorOval);
        this.#toolFocusReplace(this.btnSpriteEditorLine);
        this.#toolFocusReplace(this.btnSpriteEditorBucket);

        if(event.currentTarget.id == "btnSpriteEditorBrushTool"){
            this.#toolFocusToggle(this.btnSpriteEditorBrushTool);
            if(this.btnSpriteEditorBrushTool.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorBrushTool");
        }else if(event.currentTarget.id == "btnSpriteEditorRectangle"){
            this.#toolFocusToggle(this.btnSpriteEditorRectangle);
            if(this.btnSpriteEditorRectangle.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorRectangle");
        }else if(event.currentTarget.id == "btnSpriteEditorOval"){
            this.#toolFocusToggle(this.btnSpriteEditorOval);
            if(this.btnSpriteEditorOval.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorOval");
        }else if(event.currentTarget.id == "btnSpriteEditorLine"){
            this.#toolFocusToggle(this.btnSpriteEditorLine);
            if(this.btnSpriteEditorLine.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorLine");
        }else if(event.currentTarget.id == "btnSpriteEditorBucket"){
            this.#toolFocusToggle(this.btnSpriteEditorBucket);
            if(this.btnSpriteEditorBucket.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledTool", "btnSpriteEditorBucket");
        }
    }

    #updateColorStates(event){
        this.#toolFocusReplace(this.btnSpriteEditorBlack);
        this.#toolFocusReplace(this.btnSpriteEditorWhite);

        if(event.currentTarget.id == "btnSpriteEditorBlack"){
            this.#toolFocusToggle(this.btnSpriteEditorBlack);
            if(this.btnSpriteEditorBlack.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledColor", "btnSpriteEditorBlack");
        }else if(event.currentTarget.id == "btnSpriteEditorWhite"){
            this.#toolFocusToggle(this.btnSpriteEditorWhite);
            if(this.btnSpriteEditorWhite.classList.contains("btn-primary-focus")) localStorage.setItem("SpriteEditorLastEnabledColor", "btnSpriteEditorWhite");
        }
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

        // Set the selected from index for this file
        localStorage.setItem("SpriteEditorSelectedFrame" + this.filePath, this.frameIndex);

        // When a selected frame is deleted the canvas is hidden, but now that a new canvas is clicked un-hide it
        if(this.canvas.classList.contains("invisible")){
            this.canvas.classList.remove("invisible");
        }
    }


    // Typically called from a frame object to remove the frame from the dom and the sprite data
    #deleteFrameAtIndex(frameIndex){
        // Remove the portion of data containing the the frame's data
        const frameByteLength = this.#getFrameLength();
        let frameByteOffset = 17 + (frameByteLength * frameIndex);
        let newSpriteData = new Uint8Array(this.spriteData.length - frameByteLength);               // The sprite data will end up being its length minus one frame
        newSpriteData.set(this.spriteData.slice(0, frameByteOffset));                               // Copy over portion of sprite data before the frame
        newSpriteData.set(this.spriteData.slice(frameByteOffset+frameByteLength), frameByteOffset); // Copy over portion of sprite data after the frame

        this.spriteData = newSpriteData;

        // Decrease the sprite data's frame count
        this.spriteData[14] = this.spriteData[14] - 1;

        // Save the edits to the sprite data
        this.saveCallback(this.spriteData);

        // Remove the frame from the dom list
        this.divFrameListParent.removeChild(this.divFrameListParent.children[frameIndex]);

        // Only hide the canvas if the last opened/edited frame is the same as this one being deleted
        if(this.frameIndex == frameIndex){
            this.canvas.classList.add("invisible");
        }

        // Update the frame index and save it so updateFrameList selects the correct frame
        this.frameIndex = this.frameIndex - 1;
        localStorage.setItem("SpriteEditorSelectedFrame" + this.filePath, this.frameIndex);

        // Re-add all frames back into list to make them re-index themselves (maybe too much for just re-indexing)
        this.#updateFrameList();
    }


    // Add frame behind the leading element (typically the add frame button)
    #addFrameToList(frameIndex){
        const [ frameWidth, frameHeight ] = this.#getFrameWidthHeight();
        const frameByteLength = this.#getFrameLength();

        let frameByteOffset = 17 + (frameByteLength * frameIndex);
        let frameData = this.spriteData.slice(frameByteOffset, frameByteOffset + frameByteLength);

        let newFrame = new Frame(this.btnAddFrame, frameWidth, frameHeight, this.#openFrameAtIndex.bind(this), this.#deleteFrameAtIndex.bind(this));
        newFrame.update(frameData);

        return newFrame;
    }


    // Remove all frame elements and add them back again (might get too expensive since need to recreate all canvases again...)
    #updateFrameList(){
        // Remove all frame elements from frame list
        while(this.divFrameListParent.children.length > 1){
            this.divFrameListParent.removeChild(this.divFrameListParent.children[0]);
        }

        let frameCount = this.spriteData[14];

        // Get the last selected frame from local storage to select that frame when it gets added
        let selectedFrameIndex = localStorage.getItem("SpriteEditorSelectedFrame" + this.filePath);
        if(selectedFrameIndex == null) selectedFrameIndex = 0;

        // For through frame count and call method to add frames from file sprite data
        for(let ifx=0; ifx<frameCount; ifx++){
            let frame = this.#addFrameToList(ifx);

            // Does the index match the one that was retrieved from localStorage? If so, select it
            if(ifx == selectedFrameIndex){
                frame.select();
            }
        }
    }


    // Setup parent inside editor frame element and add the button to add more frames
    #setupFrameList(){
        // Setup frame list
        this.divFrameListParent = document.createElement("div");
        this.divFrameListParent.classList = "absolute top-0 left-3 bottom-0 right-3 flex flex-col items-center";
        this.divSpriteFrameListMain.appendChild(this.divFrameListParent);

        this.btnAddFrame = document.createElement("button");
        this.btnAddFrame.classList = "btn btn-primary btn-circle btn-sm h-[30px] w-[30px] min-h-0 rounded-full mt-3"
        this.btnAddFrame.innerHTML = 
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        `
        this.btnAddFrame.onclick = (event) => {
            this.#addFrameToData();

            // Scroll to end automatically
            this.divFrameListParent.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' })
        };
        this.divFrameListParent.appendChild(this.btnAddFrame);

        this.#updateFrameList();
    }


    // Each sprite file editor gets a canvas for drawing to. Selected frames get copied to this,
    // and edits get fed back into the frame and saved in VLSB to the sprite file on every edit
    #setupDrawingCanvas(){
        // Setup drawing canvas
        this.divCanvasParent = document.createElement("div");
        this.divCanvasParent.classList = "absolute top-0 left-0 bottom-0 right-0";
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
        this.context = this.canvas.getContext('2d', {alpha: false });
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.oImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        // Used for post-processing canvas drawing functions since they add alpha
        this.offscreenToolCanvas = new OffscreenCanvas(72, 40);
        this.offscreenToolContext = this.offscreenToolCanvas.getContext('2d', {alpha: false });

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

        // Get any stored information about the drawing canvas and restore from it if it exists
        let canvasDimensionsPosition = localStorage.getItem("SpriteEditorCanvasDimensionsPosition" + this.filePath);
        if(canvasDimensionsPosition != null && canvasDimensionsPosition != "null"){
            canvasDimensionsPosition = JSON.parse(canvasDimensionsPosition);
            this.canvas.style.width = canvasDimensionsPosition[0];
            this.canvas.style.height = canvasDimensionsPosition[1];
            this.canvas.style.left = canvasDimensionsPosition[2];
            this.canvas.style.top = canvasDimensionsPosition[3];
        }
    }


    #getCanvasXY(event){
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

        // Save the update
        this.saveCallback(this.spriteData);
    }


    // Handles draw start (mouse down), move, and end (mouse up)
    #handleDrawing(event){
        // Start this drawing operation
        this.context.beginPath();
        this.offscreenToolContext.beginPath();

        // Set this drawing operation's color using the focus of the current color button for state
        if(this.btnSpriteEditorBlack.classList.contains("btn-primary-focus")){
            this.context.fillStyle = "black";
            this.context.strokeStyle = "black";
        }else{
            this.context.fillStyle = "white";
            this.context.strokeStyle = "white";
        }

        // Get the cursor's x and y canvas coordinates
        let [x, y] = this.#getCanvasXY(event);
        const [ frameWidth, frameHeight ] = this.#getFrameWidthHeight();

        // Only track mouse events if left-click
        if(event.buttons == 1){
            if(event.type == "mousedown"){
                // On mouse down, save the coordinates for reference in end, and save the frame to restore from as previews are drawn
                this.drawingStartX = x;
                this.drawingStartY = y;
                this.drawingStartFrame = this.context.getImageData(0, 0, frameWidth, frameHeight);

                // If in brush mode, a click should place a pixel
                if(this.btnSpriteEditorBrushTool.classList.contains("btn-primary-focus")){
                    this.context.fillRect(x, y, 1, 1);
                }else if(this.btnSpriteEditorBucket.classList.contains("btn-primary-focus")){
                    // Recursively look for pixels to set and then look around for more pixels
                    let newImageData = this.context.getImageData(0, 0, frameWidth, frameHeight);

                    let getPixelColor = (newX, newY) => {
                        return newImageData.data[(frameWidth * newY + newX)*4];
                    }

                    // The color to make into fill color and spread from
                    let baseColor = getPixelColor(x, y);
                    let fillColor = this.context.fillStyle == '#000000' ? 0 : 255;

                    if(baseColor != fillColor){
                        let setPixelToFill = (newX, newY) => {
                            let xyi = (frameWidth * newY + newX)*4;
                            newImageData.data[xyi] = fillColor;
                            newImageData.data[xyi+1] = fillColor;
                            newImageData.data[xyi+2] = fillColor;
                        }
                        let spreadPixels = (newX, newY) => {
                            // Set this pixel to the fill or stroke color
                            setPixelToFill(newX, newY);
                            if(newX+1 < frameWidth && getPixelColor(newX+1, newY) == baseColor){
                                spreadPixels(newX+1, newY);
                            }
                            if(newY+1 < frameHeight && getPixelColor(newX, newY+1) == baseColor){
                                spreadPixels(newX, newY+1);
                            }
                            if(newX-1 >= 0 && getPixelColor(newX-1, newY) == baseColor){
                                spreadPixels(newX-1, newY);
                            }
                            if(newY-1 >= 0 && getPixelColor(newX, newY-1) == baseColor){
                                spreadPixels(newX, newY-1);
                            }
                        }
                        spreadPixels(x, y);
                        this.context.putImageData(newImageData, 0, 0);
                    }
                }
            }else if(event.type == "mousemove"){
                if(this.btnSpriteEditorRectangle.classList.contains("btn-primary-focus")){
                    // If in rectangle mode, restore from start frame, find top-left coordinate, find
                    // width and height, then draw filled or outline rectangle depending on the checkbox
                    this.context.putImageData(this.drawingStartFrame, 0, 0);
                    let smallestX = x < this.drawingStartX ? x : this.drawingStartX;
                    let smallestY = y < this.drawingStartY ? y : this.drawingStartY;
                    let width = Math.abs(x - this.drawingStartX)+1;
                    let height = Math.abs(y - this.drawingStartY)+1;

                    if(this.checkboxSpriteEditorFilled.checked){
                        this.context.fillRect(smallestX, smallestY, width, height);
                    }else{
                        this.context.fillRect(smallestX, smallestY, width, 1);              // Top
                        this.context.fillRect(smallestX, smallestY+height, width, 1);       // Bottom
                        this.context.fillRect(smallestX, smallestY, 1, height);             // Left
                        this.context.fillRect(smallestX+width, smallestY, 1, height+1);     // Right
                    }
                }else if(this.btnSpriteEditorOval.classList.contains("btn-primary-focus")){
                    // Oval mode
                    this.context.lineWidth = 0.1;
                    this.context.putImageData(this.drawingStartFrame, 0, 0);

                    let smallestX = x < this.drawingStartX ? x : this.drawingStartX;
                    let smallestY = y < this.drawingStartY ? y : this.drawingStartY;
                    let width = Math.abs(x - this.drawingStartX)+1;
                    let height = Math.abs(y - this.drawingStartY)+1;

                    this.offscreenToolCanvas.width = width;
                    this.offscreenToolCanvas.height = height;

                    this.offscreenToolContext.lineWidth = this.context.lineWidth;
                    this.offscreenToolContext.fillStyle = "red";
                    this.offscreenToolContext.strokeStyle = "red";

                    this.offscreenToolContext.ellipse(width/2, height/2, width/2, height/2, 0, 0, 2 * Math.PI);
                    this.offscreenToolContext.stroke();
                    if(this.checkboxSpriteEditorFilled.checked){
                        this.offscreenToolContext.fill();
                    }

                    let offscreenToolImageData = this.offscreenToolContext.getImageData(0, 0, width, height);
                    for(let ipx = 0; ipx<offscreenToolImageData.data.length; ipx += 4) {
                        if(offscreenToolImageData.data[ipx] > 7){
                            let py = Math.floor((ipx/4)/width);
                            let px = (ipx/4) % width; 
                            this.context.fillRect(smallestX+px, smallestY+py, 1, 1);
                        }
                    }
                }if(this.btnSpriteEditorBrushTool.classList.contains("btn-primary-focus")){
                    // If in brush mode, place pixels as the mouse moves
                    this.context.fillRect(x, y, 1, 1);
                }else if(this.btnSpriteEditorLine.classList.contains("btn-primary-focus")){
                    // Line mode
                    this.context.lineWidth = 0.1;
                    this.context.putImageData(this.drawingStartFrame, 0, 0);

                    let smallestX = x < this.drawingStartX ? x : this.drawingStartX;
                    let smallestY = y < this.drawingStartY ? y : this.drawingStartY;
                    let width = Math.abs(x - this.drawingStartX)+1;
                    let height = Math.abs(y - this.drawingStartY)+1;

                    this.offscreenToolCanvas.width = width;
                    this.offscreenToolCanvas.height = height;

                    this.offscreenToolContext.lineWidth = this.context.lineWidth;
                    this.offscreenToolContext.fillStyle = "red";
                    this.offscreenToolContext.strokeStyle = "red";

                    this.offscreenToolContext.moveTo(this.drawingStartX-smallestX, this.drawingStartY-smallestY);
                    this.offscreenToolContext.lineTo(x-smallestX, y-smallestY);
                    this.offscreenToolContext.stroke();
                    if(this.checkboxSpriteEditorFilled.checked){
                        this.offscreenToolContext.fill();
                    }

                    let offscreenToolImageData = this.offscreenToolContext.getImageData(0, 0, width, height);
                    for(let ipx = 0; ipx<offscreenToolImageData.data.length; ipx += 4) {
                        if(offscreenToolImageData.data[ipx] > 12){
                            let py = Math.floor((ipx/4)/width);
                            let px = (ipx/4) % width; 
                            this.context.fillRect(smallestX+px, smallestY+py, 1, 1);
                        }
                    }
                }
            }else if(event.type == "mouseup"){

            }
        }

        // End this drawing operation
        this.context.stroke();
        if(this.checkboxSpriteEditorFilled.checked){
            this.context.fill();
        }
        this.#updateSpriteFrame();
    }


    #setupDrawing(){
        this.canvas.onmousemove = (event) => {
            const [x, y] = this.#getCanvasXY(event);

            // // Clear the last drawn gray pixel if it exists
            // if(this.lastColor != undefined){
            //     if(this.lastColor[0] == 255){
            //         this.context.fillStyle = "white";
            //     }else{
            //         this.context.fillStyle = "black";
            //     }
            //     this.context.beginPath();
            //     this.context.fillRect(this.lastX, this.lastY, 1, 1);
            //     this.context.stroke();
            // }

            // // Before drawing the gray pixel, get the color under it
            // this.lastColor = this.context.getImageData(x, y, 1, 1).data;

            // // Draw the gray/selected pixel
            // this.context.beginPath();
            // this.context.fillStyle = "gray";
            // this.context.fillRect(x, y, 1, 1);
            // this.context.stroke();

            this.#handleDrawing(event);

            // this.lastX = x;
            // this.lastY = y;
        }
        this.canvas.oncontextmenu = (event) => {
            // Prevent right-click since leaves gray pixel (hacky solution)
            event.preventDefault();
        }
        this.canvas.onmousedown = (event) => {
            // const [x, y] = this.#getCanvasXY(event);

            this.#handleDrawing(event);

            // this.frameContext.drawImage(this.canvas, 0, 0);
            // this.lastX = x;
            // this.lastY = y;
        }
        this.canvas.onmouseup = (event) => {
            this.#handleDrawing(event);
        }
        this.canvas.onmouseleave = (event) => {
            // // Clear the last drawn gray pixel if it exists
            // if(this.lastColor != undefined){
            //     if(this.lastColor[0] == 255){
            //         this.context.fillStyle = "white";
            //     }else{
            //         this.context.fillStyle = "black";
            //     }
            //     this.context.beginPath();
            //     this.context.fillRect(this.lastX, this.lastY, 1, 1);
            //     this.context.stroke();
            // }
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

                    // Store the canvas dimensions and position for later restoration
                    localStorage.setItem("SpriteEditorCanvasDimensionsPosition" + this.filePath, JSON.stringify([this.canvas.style.width, this.canvas.style.height, this.canvas.style.left, this.canvas.style.top]));
                }
            }
        });
    }


    #zoom(factor){
        let canvasDOMWidth = parseFloat(this.canvas.style.width);
        let canvasDOMHeight = parseFloat(this.canvas.style.height);

        let newCanvasDOMWidth = canvasDOMWidth * factor;
        let newCanvasDOMHeight = newCanvasDOMWidth / (canvasDOMWidth/canvasDOMHeight);

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

        // Store the canvas dimensions and position for later restoration
        localStorage.setItem("SpriteEditorCanvasDimensionsPosition" + this.filePath, JSON.stringify([this.canvas.style.width, this.canvas.style.height, this.canvas.style.left, this.canvas.style.top]));
    }


    // Scroll wheel allows zooming
    #setupZooming(){
        // Zoom the canvas in and out based on cursor and current location using scroll wheel
        this.divCanvasParent.onwheel = (event) => {
            event.preventDefault();

            if(event.deltaY < 0){
                this.#zoom(1.25);
            }else if(event.deltaY > 0){
                this.#zoom(1 / 1.25);
            }
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


    // When the tab parent gets a rename event, also need to change keys here
    changeFilePath(filePath){
        // Change local storage keys
        localStorage.setItem("SpriteEditorSelectedFrame" + filePath, localStorage.getItem("SpriteEditorSelectedFrame" + this.filePath));
        localStorage.setItem("SpriteEditorCanvasDimensionsPosition" + filePath, localStorage.getItem("SpriteEditorCanvasDimensionsPosition" + this.filePath));
        localStorage.removeItem("SpriteEditorSelectedFrame" + this.filePath);
        localStorage.removeItem("SpriteEditorCanvasDimensionsPosition" + this.filePath);
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

        // Preview module from sprite editor manager
        this.spriteAnimationPreview.setFrameListParent(this.divFrameListParent);

        if(this.divCanvasParent != undefined){
            this.divCanvasParent.classList.remove("invisible");
        }
    }


    // When the tab in the tab header closes, remove everything related to canvas editing (canvas, frames, etc)
    close(){
        this.divEditorMain.removeChild(this.divCanvasParent);
        this.divSpriteFrameListMain.removeChild(this.divFrameListParent);

        // Set the parent element of the list of frames to undefined in case a new sprite is not selected
        this.spriteAnimationPreview.setFrameListParent(undefined);

        // Remove the stored selected frame index for this file so a new file with teh same name doesn't restore from it
        localStorage.removeItem("SpriteEditorSelectedFrame" + this.filePath);

        // REmove the canvas dimensions and position for later restoration
        localStorage.removeItem("SpriteEditorCanvasDimensionsPosition" + this.filePath);

        // Remove any listeners
        document.getElementById("btnSpriteEditorZoomIn").removeEventListener("click", this.listenerZoomIn);
        document.getElementById("btnSpriteEditorZoomOut").removeEventListener("click", this.listenerZoomOut);
        document.getElementById("btnSpriteEditorFitCanvas").removeEventListener("click", this.listenerFitCanvas);
        this.btnSpriteEditorBrushTool.removeEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorRectangle.removeEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorOval.removeEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorLine.removeEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorBucket.removeEventListener("click", this.#updateToolState.bind(this));
        this.btnSpriteEditorBlack.removeEventListener("click", this.#updateColorStates.bind(this));
        this.btnSpriteEditorWhite.removeEventListener("click", this.#updateColorStates.bind(this));
        this.btnSpriteEditorResize.removeEventListener("click", this.#fillResizePrompt.bind(this));
        this.btnSpriteEditorResizeConfirm.removeEventListener("click", this.#resizeFrames.bind(this));
    }
}

export { SpriteTabCanvas }