class SpriteAnimationPreview{
    constructor(){
        this.canvasSpriteFramePreview = document.getElementById("canvasSpriteFramePreview");
        this.previewContext = this.canvasSpriteFramePreview.getContext('2d', { alpha: false });
        this.previewContext.imageSmoothingEnabled = false;
        this.previewContext.mozImageSmoothingEnabled = false;
        this.previewContext.oImageSmoothingEnabled = false;
        this.previewContext.webkitImageSmoothingEnabled = false;
        this.previewContext.msImageSmoothingEnabled = false;


        this.divSpriteFramePreviewLabel = document.getElementById("divSpriteFramePreviewLabel");
        this.inputSpriteFramePreviewSpeed = document.getElementById("inputSpriteFramePreviewSpeed");
        this.inputSpriteFramePreviewSpeed.oninput = (event) => {
            this.divSpriteFramePreviewLabel.textContent = "Preview speed (" + event.target.value +"fps)";
            this.fpsInterval = 1000 / parseInt(event.target.value);

            localStorage.setItem("SpriteAnimationPreviewSpeed", event.target.value);
        }


        // https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe#comment38674664_19772220
        let fps = localStorage.getItem("SpriteAnimationPreviewSpeed");
        if(fps == null){
            this.fpsInterval = 1000 / 24;   // How many ms a frame takes up
        }else{
            this.fpsInterval = 1000 / parseInt(fps);
            this.inputSpriteFramePreviewSpeed.value = fps;
            this.divSpriteFramePreviewLabel.textContent = "Preview speed (" + fps +"fps)";
        }
        
        this.frameIndex = 0;
        this.t0 = performance.now();

        this.#animate();
    }

    #animate(newtime){
        let dt = newtime - this.t0;
        if(this.frameListParent != undefined && dt >= this.fpsInterval){
            // Loop back to first frame at end of list of frames (minus one to not include add button)
            if(this.frameIndex >= this.frameListParent.children.length-1){
                this.frameIndex = 0;
            }

            // Resize preview to whatever the frame is set to
            let frameWidth = this.frameListParent.children[this.frameIndex].children[0].width;
            let frameHeight = this.frameListParent.children[this.frameIndex].children[0].height;
            this.canvasSpriteFramePreview.style.aspectRatio = frameWidth + "/" + frameHeight;
            this.canvasSpriteFramePreview.width = frameWidth;
            this.canvasSpriteFramePreview.height = frameHeight;

            this.previewContext.drawImage(this.frameListParent.children[this.frameIndex].children[0], 0, 0);

            this.t0 = newtime - (dt % this.fpsInterval);
            this.frameIndex++;
        }

        requestAnimationFrame(this.#animate.bind(this));
    }
 
    setFrameListParent(frameListParent){
        this.frameListParent = frameListParent;

        // Reset this in case new parent length is smaller
        this.frameIndex = 0;
    }
}

export { SpriteAnimationPreview }