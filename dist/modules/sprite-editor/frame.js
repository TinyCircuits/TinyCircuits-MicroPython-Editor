class Frame{
    constructor(leadingElement, width, height, openCallback = (frameCanvas, frameContext, index) => {}){        
        // The leading element is where this frame should input itself,
        // and the index is the index in teh frameList of the module that
        // uses this frame
        this.leadingElement = leadingElement;

        // Width and height of the frame
        this.width = width;
        this.height = height;

        this.openCallback = openCallback;

        // Parent of the frame canvas that is inserted into the list and contains other useful info/graphics
        this.divFrameContainer = document.createElement("div");
        this.divFrameContainer.classList = "border border-gray-400 min-w-full mt-3";
        this.divFrameContainer.onclick = (event) => {
            this.select();
        }

        // leadingElement.parentElement.appendChild(this.divFrameContainer);
        leadingElement.parentElement.insertBefore(this.divFrameContainer, this.leadingElement);

        this.#resize();

        // The canvas all the drawing is done on
        this.canvas = document.createElement("canvas");
        this.canvas.classList = "crisp-canvas";

        // Setup default dimensions
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
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

        let frameIndex = Array.prototype.indexOf.call(this.leadingElement.parentElement.children, this.divFrameContainer);
        this.openCallback(this.canvas, this.context, frameIndex);
    }


    #resize(){
        this.divFrameContainer.style.aspectRatio = this.width + "/" + this.height;
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