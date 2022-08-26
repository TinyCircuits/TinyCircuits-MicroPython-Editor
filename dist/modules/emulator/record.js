class Record{
    constructor(){
        this.canvasEmulator = document.getElementById("canvasEmulator");
        this.btnEmulatorVideo = document.getElementById("btnEmulatorVideo");
        this.btnEmulatorScreenshot = document.getElementById("btnEmulatorScreenshot");

        // Use offscreen canvas to render css rotated and scaled emulator canvas during recording or screenshots
        this.recordingCanvas = document.createElement("canvas");
        this.recordingCanvas.width = 72;
        this.recordingCanvas.height = 40;
        this.recordingContext = this.recordingCanvas.getContext('2d', { alpha: false });

        this.recording = false;

        this.stream = this.recordingCanvas.captureStream();
        this.recordedChunks = [];

        this.recorder = new MediaRecorder(this.stream, {});

        this.recorder.ondataavailable = (event) => {
            this.recordedChunks.push(event.data);

            // After stop `dataavilable` event run one more time to push last chunk
            if (this.recorder.state === 'recording') {
                this.recorder.stop();
            }
        }
        this.recorder.onstop = (event) => {
            let blob = new Blob(this.recordedChunks, {type: "video/webm" });
            let url = URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.download = 'emulator_video.webm';
            link.href = url;
            link.click();
            window.URL.revokeObjectURL(url);
        }


        if(this.btnEmulatorVideo) this.btnEmulatorVideo.onclick = (event) => {
            if(this.recording == false){
                // Start recording based on state using background color of button
                this.recording = true;
                btnEmulatorVideo.style.backgroundColor = "rgb(200, 0, 0)";
                this.recordedChunks = [];
                this.recorder.start();
            }else{
                // Stop recording
                this.recording = false;
                btnEmulatorVideo.style.backgroundColor = "";
                this.recorder.stop();
            }
        }

        if(this.btnEmulatorScreenshot) this.btnEmulatorScreenshot.onclick = (event) => {
            this.takeScreenshot();
        }
    }


    #getCanvasRotationWidthHeight(){
        let rotation = this.canvasEmulator.style.transform;
        if(rotation == ""){
            rotation = 0;
        }else{
            rotation = parseInt(rotation.slice(rotation.indexOf('(')+1, rotation.indexOf('deg')));
        }

        let width = parseInt(this.canvasEmulator.style.width);
        let height = parseInt(this.canvasEmulator.style.height);
        return { rotation, width, height };
    }


    // Needs to be called every time after a rotate or scale of the canvas
    #disableSmoothing(){
        this.recordingContext.imageSmoothingEnabled = false;
        this.recordingContext.mozImageSmoothingEnabled = false;
        this.recordingContext.oImageSmoothingEnabled = false;
        this.recordingContext.webkitImageSmoothingEnabled = false;
        this.recordingContext.msImageSmoothingEnabled = false;
    }


    #scaleAndRotateOffscreen(imageBitmap){
        const { rotation, width, height } = this.#getCanvasRotationWidthHeight();
        const scale = width / 72;

        this.recordingContext.save();

        if(rotation == -90 || rotation == -270){
            this.recordingCanvas.width = height;
            this.recordingCanvas.height = width;
            this.recordingContext.translate(height/2, width/2);
        }else{
            this.recordingCanvas.width = width;
            this.recordingCanvas.height = height;
            this.recordingContext.translate(width/2, height/2);
        }

        this.recordingContext.rotate(rotation * Math.PI / 180);
        this.recordingContext.scale(scale, scale);

        this.#disableSmoothing();

        if(imageBitmap != undefined){
            this.recordingContext.drawImage(imageBitmap, -36, -20);
        }else{
            this.recordingContext.drawImage(this.canvasEmulator, -36, -20);
        }

        this.recordingContext.restore();
    }


    takeScreenshot(){
        this.#scaleAndRotateOffscreen();

        let link = document.createElement('a');
        link.download = 'thumby_emulator_screenshot.png';
        link.href = this.recordingCanvas.toDataURL();
        link.click();
    }


    // External module needs to
    sendFrame(pixels){
        if(this.recording == true){
            // Need to use drawImage to fire mediaRecorder event to capture data, so convert to bitmap first
            createImageBitmap(pixels).then((imgBitmap) => {
                this.#scaleAndRotateOffscreen(imgBitmap);
            });
        }
    }
}

export { Record }