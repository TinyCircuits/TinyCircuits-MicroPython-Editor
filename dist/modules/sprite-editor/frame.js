class Frame{
    constructor(leadingElement, frameListIndex, width, height){
        // The leading element is where this frame should input itself,
        // and the index is the index in teh frameList of the module that
        // uses this frame
        this.leadingElement = leadingElement;
        this.frameListIndex = frameListIndex;

        // Width and height of the frame
        this.width = width;
        this.height = height;

        // Parent of the frame canvas that is inserted into the list and contains other useful info/graphics
        this.divFrameContainer = document.createElement("div");
        this.divFrameContainer.classList = "border border-black min-w-full mt-3";

        // leadingElement.parentElement.appendChild(this.divFrameContainer);
        leadingElement.parentElement.insertBefore(this.divFrameContainer, this.leadingElement);

        this.#resize();
    }


    #resize(){
        this.divFrameContainer.style.aspectRatio = this.width + "/" + this.height;
    }


    setWidthHeight(width, height){
        this.width = width;
        this.height = height;
    }
}

export { Frame }