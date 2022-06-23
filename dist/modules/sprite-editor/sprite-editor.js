class SpriteEditor{
    constructor(){
        // The full panel containing the parents of the list and editor view
        this.divSprite = document.getElementById("divSprite");

        // The editor view and panning start tracking
        this.divSpriteEditor = document.getElementById("divSpriteEditor");
        this.panning = false;
        this.divSpriteEditor.onmousedown = (event) => {
            this.panning = true;
        }

        this.divSpriteList = document.getElementById("divSpriteList");
        
        // Parent div panels for list and editor
        this.divSpriteEditorParent = document.getElementById("divSpriteEditorParent");
        this.divSpriteEditorParent.style.width = this.divSpriteEditorParent.clientWidth + "px";

        this.divSpriteListParent = document.getElementById("divSpriteListParent");
        this.divSpriteListParent.style.width = this.divSpriteListParent.clientWidth + "px";

        // Handle dragging the between the list and editor
        this.divSpriteDraggable = document.getElementById("divSpriteDraggable");
        this.dragging = false;
        this.divSpriteDraggable.onmousedown = (event) => {
            this.dragging = true;
        }


        // Certain dragging and panning events should be reset after respective
        // mousedown events when the mouse button is released
        document.addEventListener("mouseup", (event) => {
            if(this.shown){
                this.dragging = false;
                this.panning = false;
            }
        });


        // Get and setup the canvas and get its context
        this.canvasSpriteEditor = document.getElementById("canvasSpriteEditor");
        this.canvasSpriteEditor.style.width = this.canvasSpriteEditor.clientWidth + "px";
        this.canvasSpriteEditor.style.height = this.canvasSpriteEditor.clientHeight  + "px";

        this.context = this.canvasSpriteEditor.getContext('2d', { alpha: false });
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.oImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(71, 39);
        this.context.strokeStyle = "white";
        this.context.stroke();

        // Set externally through workspace selection callback (typically)
        this.shown = false;

        // When the div containing the canvas is resized, ensure the canvas
        // doesn't go too far out of bounds
        this.resizeObserver = new ResizeObserver(() => {
            this.#checkCanvasBounds();
        }).observe(this.divSpriteEditor);


        document.addEventListener("mousemove", (event) => {
            if(this.shown){
                // When the mouse moves and event.buttons == 4, pan the canvas around
                // Set the cursor to indicate pan action is enabled
                if(event.buttons == 4 && this.panning){
                    this.divSpriteEditor.style.cursor = "grab";
    
                    let editorDOMWidth = this.divSpriteEditor.clientWidth;
                    let editorDOMHeight = this.divSpriteEditor.clientHeight;
                    let canvasDOMWidth = parseInt(this.canvasSpriteEditor.style.width);
                    let canvasDOMHeight = parseInt(this.canvasSpriteEditor.style.height);
    
                    let newCanvasDOMLeft = parseInt(this.canvasSpriteEditor.style.left) + event.movementX;
                    let newCanvasDOMTop = parseInt(this.canvasSpriteEditor.style.top) + event.movementY;
    
                    // Set new position
                    this.canvasSpriteEditor.style.left = newCanvasDOMLeft + "px";
                    this.canvasSpriteEditor.style.top = newCanvasDOMTop + "px";

                    // Make sure it is still in bounds
                    this.#checkCanvasBounds();
                }else{
                    this.divSpriteEditor.style.cursor = "default";
                }

                // Change list and editor widths on drag, save to localstorage for later restoration
                if(event.buttons == 1 && this.dragging){
                    event.preventDefault();
                    this.divSpriteListParent.style.width = parseInt(this.divSpriteListParent.style.width) + event.movementX + "px";
                    this.divSpriteEditorParent.style.width = parseInt(this.divSpriteEditorParent.style.width) - event.movementX + "px";

                    localStorage.setItem("divSpriteListParentWidth", this.divSpriteListParent.style.width);
                    localStorage.setItem("divSpriteEditorParentWidth", this.divSpriteEditorParent.style.width);
                }
            }
        });


        // Zoom the canvas in and out based on cursor and current location using scroll wheel
        this.divSpriteEditor.onwheel = (event) => {
            event.preventDefault();

            let canvasDOMWidth = parseFloat(this.canvasSpriteEditor.style.width);
            let canvasDOMHeight = parseFloat(this.canvasSpriteEditor.style.height);

            let newCanvasDOMWidth = undefined;
            let newCanvasDOMHeight = undefined;

            if(event.deltaY < 0){
                newCanvasDOMWidth = canvasDOMWidth * 1.25;
            }else if(event.deltaY > 0){
                newCanvasDOMWidth = canvasDOMWidth / 1.25;
            }
            newCanvasDOMHeight = newCanvasDOMWidth / (canvasDOMWidth/canvasDOMHeight);

            this.canvasSpriteEditor.style.width = newCanvasDOMWidth + "px";
            this.canvasSpriteEditor.style.height = newCanvasDOMHeight + "px";

            let x = parseFloat(this.canvasSpriteEditor.style.left);
            let y = parseFloat(this.canvasSpriteEditor.style.top);

            let pdx = (newCanvasDOMWidth - canvasDOMWidth)/2;
            let pdy = (newCanvasDOMHeight - canvasDOMHeight)/2;

            this.canvasSpriteEditor.style.left = (x - pdx) + "px";
            this.canvasSpriteEditor.style.top = (y - pdy) + "px";

            // Make sure it is still in bounds
            this.#checkCanvasBounds();
        }

        this.#centerCanvas();

        // Restore list and editor parent widths from localstorage
        let divSpriteListParentWidth = localStorage.getItem("divSpriteListParentWidth");
        let divSpriteEditorParentWidth = localStorage.getItem("divSpriteEditorParentWidth");
        if(divSpriteListParentWidth != null && divSpriteEditorParentWidth != null){
            this.divSpriteListParent.style.width = divSpriteListParentWidth;
            this.divSpriteEditorParent.style.width = divSpriteEditorParentWidth;
        }
    }


    #centerCanvas(){
        let editorDOMWidth = this.divSpriteEditor.clientWidth;
        let editorDOMHeight = this.divSpriteEditor.clientHeight;

        let canvasDOMWidth = this.canvasSpriteEditor.clientWidth;
        let canvasDOMHeight = this.canvasSpriteEditor.clientHeight;

        this.canvasSpriteEditor.style.left = ((editorDOMWidth/2) - (canvasDOMWidth/2)) + "px";
        this.canvasSpriteEditor.style.top = ((editorDOMHeight/2) - (canvasDOMHeight/2)) + "px";
    }


    // If the canvas goes out of bounds of the editor
    // viewport, make sure it gets stuck one pixel inside
    #checkCanvasBounds(){
        let editorDOMWidth = this.divSpriteEditor.clientWidth;
        let editorDOMHeight = this.divSpriteEditor.clientHeight;
        let canvasDOMWidth = parseInt(this.canvasSpriteEditor.style.width);
        let canvasDOMHeight = parseInt(this.canvasSpriteEditor.style.height);
        let canvasDOMLeft = parseInt(this.canvasSpriteEditor.style.left);
        let canvasDOMTop = parseInt(this.canvasSpriteEditor.style.top);

        if(canvasDOMLeft+canvasDOMWidth < 0){
            this.canvasSpriteEditor.style.left = -(canvasDOMWidth-2) + "px";
        }else if(canvasDOMLeft > editorDOMWidth){
            this.canvasSpriteEditor.style.left = editorDOMWidth-2 + "px";
        }

        if(canvasDOMTop+canvasDOMHeight < 0){
            this.canvasSpriteEditor.style.top = -(canvasDOMHeight-2) + "px";
        }else if(canvasDOMTop > editorDOMHeight){
            this.canvasSpriteEditor.style.top = editorDOMHeight-2 + "px";
        }
    }


    // Resets the width of the sprite list and editor parents, hardcoded values
    resetLayoutSize(){
        let newEditorWidth = this.divSprite.clientWidth * 0.85;
        let newListWidth = this.divSprite.clientWidth * 0.15;
        this.divSpriteEditorParent.style.width = newEditorWidth + "px";
        this.divSpriteListParent.style.width = newListWidth + "px";

        // Save new widths to localstorage
        localStorage.setItem("divSpriteListParentWidth", this.divSpriteListParent.style.width);
        localStorage.setItem("divSpriteEditorParentWidth", this.divSpriteEditorParent.style.width);
    }
}

export { SpriteEditor }