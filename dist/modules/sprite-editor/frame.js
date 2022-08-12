class Frame{
    constructor(leadingElement, width, height, openCallback = (frameCanvas, frameContext, index) => {}, deleteCallback = (index) => {}, duplicateCallback = (index) => {}, moveFrameCallback = (index, moveUp) => {}){        
        // The leading element is where this frame should input itself,
        // and the index is the index in teh frameList of the module that
        // uses this frame
        this.leadingElement = leadingElement;

        // Width and height of the frame
        this.width = width;
        this.height = height;

        this.openCallback = openCallback;
        this.deleteCallback = deleteCallback;
        this.duplicateCallback = duplicateCallback;
        this.moveFrameCallback = moveFrameCallback;

        // Parent of the frame canvas that is inserted into the list and contains other useful info/graphics
        this.divFrameContainer = document.createElement("div");
        this.divFrameContainer.classList = "border border-gray-400 min-w-full max-w-full mt-3 relative aspect-square flex justify-center items-center bg-base-200";
        this.divFrameContainer.onclick = (event) => {
            // Make sure clicking the options (three dots) doesn't select the frame (annoying)
            if(event.target.toString() != "[object SVGSVGElement]" && event.target.toString() != "[object SVGPathElement]"){
                this.select();
            }
        }

        // leadingElement.parentElement.appendChild(this.divFrameContainer);
        leadingElement.parentElement.insertBefore(this.divFrameContainer, this.leadingElement);

        // The canvas all the drawing is done on
        this.canvas = document.createElement("canvas");
        this.canvas.classList = "crisp-canvas";

        // When the frame is recreated on list update, figure out with size to use
        if(this.width >= this.height){
            this.canvas.classList.add("min-w-full");
        }else if(this.width < this.height){
            this.canvas.classList.add("min-h-full");
        }

        // Setup default dimensions
        // this.canvas.style.width = "100%";
        // this.canvas.style.height = "100%";
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Get the context for drawing and disable any smoothing
        this.context = this.canvas.getContext('2d', { alpha: false });
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.oImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        // Add the canvas to the canvas parent div
        this.divFrameContainer.appendChild(this.canvas);

        this.divFrameIndexIndicator = document.createElement("div");
        this.divFrameIndexIndicator.innerHTML = `
        <div class="absolute bg-transparent top-0 left-0 w-fit h-fit px-1 opacity-0 transition-all ease-linear duration-100 rounded-br-md select-none">
            ` + this.getFrameIndex() + `
        </div>
        `
        this.divFrameContainer.appendChild(this.divFrameIndexIndicator);


        // Options div is always same and exists to indicate to the user that they can click it
        this.optionsDiv = document.createElement("div");
        this.optionsDiv.title = "Frame options";
        this.optionsDiv.classList = "w-6 h-6 absolute opacity-0 right-0 top-0 mt-0.5 rounded-full hover:stroke-accent";
        this.optionsDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-accent" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
        `;
        this.optionsDiv.onclick = (event) => {
            let rect = this.optionsDiv.getBoundingClientRect();
            this.divOptionsDropdown.style.left = rect.x + "px";
            this.divOptionsDropdown.style.top = rect.y + "px";
            this.divOptionsDropdown.classList.remove("invisible");
        }
        this.divFrameContainer.appendChild(this.optionsDiv);


        this.divOptionsDropdown = document.createElement("div");
        this.divOptionsDropdown.classList = "absolute z-[1000] invisible";
        this.divOptionsDropdown.innerHTML = `
        <ul tabindex="0" class="menu p-1 shadow bg-base-300 rounded-box w-fit whitespace-nowrap flex flex-col items-center">
            <label><li><a>Duplicate</a></li></label>
            <label><li><a>Move up</a></li></label>
            <label><li><a>Move down</a></li></label>
            <div class="divider mt-0 mb-0"></div>
            <label><li><a>Delete</a></li></label>
            
        </ul>
        `
        this.divOptionsDropdown.onmouseleave = (event) => {
            this.divOptionsDropdown.classList.add("invisible");
        }

        // Handle the duplicate button
        this.divOptionsDropdown.children[0].children[0].onclick = (event) => {
            this.divOptionsDropdown.classList.add("invisible");
            this.duplicateCallback(this.getFrameIndex());
        }

        // Handle the move up button
        this.divOptionsDropdown.children[0].children[1].onclick = (event) => {
            this.divOptionsDropdown.classList.add("invisible");
            this.moveFrameCallback(this.getFrameIndex(), true);
        }

        // Handle the move down button
        this.divOptionsDropdown.children[0].children[2].onclick = (event) => {
            this.divOptionsDropdown.classList.add("invisible");
            this.moveFrameCallback(this.getFrameIndex(), false);
        }

        // Handle the delete button
        this.divOptionsDropdown.children[0].children[4].onclick = (event) => {
            this.divOptionsDropdown.classList.add("invisible");
            this.deleteCallback(this.getFrameIndex());
        }

        document.body.appendChild(this.divOptionsDropdown);


        // Show/hide frame index and options div on mouse hover over frame
        this.divFrameContainer.onmouseenter = (event) => {
            this.divFrameIndexIndicator.children[0].classList.add("opacity-100");
            this.divFrameIndexIndicator.children[0].classList.remove("opacity-0");
            this.optionsDiv.classList.add("opacity-100");
            this.optionsDiv.classList.remove("opacity-0");
        }
        this.divFrameContainer.onmouseleave = (event) => {
            this.divFrameIndexIndicator.children[0].classList.remove("opacity-100");
            this.divFrameIndexIndicator.children[0].classList.add("opacity-0");
            this.optionsDiv.classList.remove("opacity-100");
            this.optionsDiv.classList.add("opacity-0");
        }
    }


    // Gets index from dom
    getFrameIndex(){
        return Array.prototype.indexOf.call(this.leadingElement.parentElement.children, this.divFrameContainer);
    }


    select(){
        // Remove selected outline from all other frame elements
        for(let icx=0; icx<this.leadingElement.parentElement.children.length; icx++){
            this.leadingElement.parentElement.children[icx].classList.remove("outline");
            this.leadingElement.parentElement.children[icx].classList.remove("outline-2");
            this.leadingElement.parentElement.children[icx].classList.remove("outline-gray-400");
        }

        // Add selected outline to this frame element
        this.divFrameContainer.classList.add("outline");
        this.divFrameContainer.classList.add("outline-2");
        this.divFrameContainer.classList.add("outline-gray-400");

        this.openCallback(this.canvas, this.context, this.getFrameIndex());
    }


    async update(vlsbFrameData){
        let displayPixelBuffer = new Uint8ClampedArray(new ArrayBuffer(this.width * this.height * 4));

        let ib = 0;
        for(let row=0; row < this.height; row+=8){
            for(let col=0; col < this.width; col++){
                for(let i=0; i<8; i++){
                    const x = col;
                    const y = row + i;
                    const bit = ((vlsbFrameData[ib] & (1 << i)) === 0 ? 0 : 255);
                    const p = (y * this.width + x) * 4;
                    displayPixelBuffer[p] = bit;
                    displayPixelBuffer[p+1] = bit;
                    displayPixelBuffer[p+2] = bit;
                    displayPixelBuffer[p+3] = 255;
                }
        
                ib += 1;
            }
        }
        
        this.context.putImageData(new ImageData(displayPixelBuffer, this.width, this.height), 0, 0);
    }


    setWidthHeight(width, height){
        this.width = width;
        this.height = height;
    }
}

export { Frame }