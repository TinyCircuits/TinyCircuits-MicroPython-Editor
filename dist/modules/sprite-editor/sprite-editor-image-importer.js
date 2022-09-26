class ImageImporter{
    constructor(){
        this.spriteEditorImageDrop = document.getElementById("spriteEditorImageDrop");

        // Prevent defaults on drag enter and over so drop event fires, also change border
        this.spriteEditorImageDrop.ondragenter = (event) => {
            event.preventDefault();
            this.spriteEditorImageDrop.classList.replace("border", "border-2");
        }
        this.spriteEditorImageDrop.ondragover = (event) => {
            event.preventDefault();
            this.spriteEditorImageDrop.classList.replace("border", "border-2");
        }


        this.spriteEditorImageDrop.ondrop = (event) => {
            event.preventDefault();
            this.spriteEditorImageDrop.classList.replace("border-2", "border");
        }
        this.spriteEditorImageDrop.onclick = (event) => {
            window.showOpenFilePicker({types: [
                {
                  description: 'Images',
                  accept: {
                    'image/*': ['.png', '.jpeg', '.jpg']
                  }
                },
              ],
              excludeAcceptAllOption: true,
            }).then((files) => {
                console.log(files);
            })
            this.spriteEditorImageDrop.classList.replace("border-2", "border");
        }
        this.spriteEditorImageDrop.ondragleave = (event) => {
            this.spriteEditorImageDrop.classList.replace("border-2", "border");
        }
    }
}

export { ImageImporter }