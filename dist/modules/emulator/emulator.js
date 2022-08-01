import { RP2040 } from './rp2040js/rp2040.js';
import { USBCDC } from './rp2040js/usb/cdc.js';
import { ConsoleLogger, LogLevel } from './rp2040js/utils/logging.js';
import { decodeBlock } from './uf2/uf2.js';
import { Littlefs } from "./littlefs/littlefs-wrapper.js";
import { Record } from './record.js';
// import { Multiplayer } from './multiplayer.js';

class Emulator{
    constructor(){
        this.canvasEmulator = document.getElementById("canvasEmulator");
        
        this.btnStopBrowser = document.getElementById("btnStopBrowser");
        this.btnZoomInEmulator = document.getElementById("btnZoomInEmulator");
        this.btnZoomOutEmulator = document.getElementById("btnZoomOutEmulator");
        this.btnRotateEmulator = document.getElementById("btnRotateEmulator");
        this.btnEmulatorAudio = document.getElementById("btnEmulatorAudio");

        this.context = this.canvasEmulator.getContext('2d', { alpha: false });
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.oImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;

        this.recorder = new Record();

        this.onOutput = (data) => {};

        this.width = 72;
        this.height = 40;

        this.muted = false;

        this.mcu = undefined;
        this.cdc = undefined;

        this.displayBufferAddress = undefined;
        this.displayBrightness = 255;

        this.displayPixelBuffer = undefined;

        this.audioContext = undefined;
        this.audioVolumeNode = undefined;
        this.audioBuzzerNode = undefined;

        this.littlefs = undefined;

        this.bootromData = undefined;
        this.firmwareData = undefined;

        this.mainFilePath = undefined;

        // Stop emulator if started, clear canvas, stop audio
        this.btnStopBrowser.onclick = () => {
            if(this.mcu != undefined){
                this.mcu.stop();
                this.mcu.reset();

                this.context.fillStyle = "black";
                this.context.fillRect(0, 0, this.width, this.height);

                this.audioVolumeNode.gain.value = 0.0;
            }
        }

        this.btnZoomInEmulator.onclick = () => {
            let w = parseInt(this.canvasEmulator.style.width);
            let h = parseInt(this.canvasEmulator.style.height);
            if(w*2 < 4608){
                this.canvasEmulator.style.width = (w*2) + "px";
                this.canvasEmulator.style.height = (h*2) + "px";
            }
        }
        this.btnZoomOutEmulator.onclick = () => {
            let w = parseInt(this.canvasEmulator.style.width);
            let h = parseInt(this.canvasEmulator.style.height);
            if(h/2 >= 40){
                this.canvasEmulator.style.width = (w/2) + "px";
                this.canvasEmulator.style.height = (h/2) + "px";
            }
        }

        this.btnRotateEmulator.onclick = () => {
            let rotation = this.canvasEmulator.style.transform;

            if(rotation == ""){
                this.canvasEmulator.style.transform = "rotate(-90deg)";
            }else{
                rotation = parseInt(rotation.slice(rotation.indexOf('(')+1, rotation.indexOf('deg'))) - 90;
                if(rotation < -270){
                    rotation = 0;
                }
                this.canvasEmulator.style.transform = "rotate(" + rotation + "deg)";
            }
        }


        this.btnEmulatorAudio.onclick = () => {
            if(this.muted){
                this.muted = false;
                this.btnEmulatorAudio.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
                </svg>
                `
            }else{
                this.muted = true;
                if(this.audioBuzzerNode != undefined) this.audioBuzzerNode.frequency.value = 0;
                this.btnEmulatorAudio.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                `
            }
        }
    }


    resetLayoutSize(){
        this.canvasEmulator.style.width = "144px";
        this.canvasEmulator.style.height = "80px";
    }


    #setupAudio(){
        this.audioContext = new(window.AudioContext || window.webkitAudioContext)();

        this.audioVolumeNode = this.audioContext.createGain();
        this.audioVolumeNode.connect(this.audioContext.destination);
        this.audioVolumeNode.gain.value = 0.25;

        this.audioBuzzerNode = this.audioContext.createOscillator();
        this.audioBuzzerNode.frequency.value = 0;
        this.audioBuzzerNode.type = "triangle";
        this.audioBuzzerNode.start();
        this.audioBuzzerNode.connect(this.audioVolumeNode);
    }


    #sendStrToCDC(str){
        for(const byte of str){
            this.cdc.sendSerialByte(byte.charCodeAt(0));
        }
    }

    write(str){
        this.#sendStrToCDC(str);
    }


    #onCDCConnected(){
        // Show normal prompt
        this.#sendStrToCDC("\x02");

        // Set default button gpio pin states
        this.mcu.gpio[24].setInputValue(true);
        this.mcu.gpio[27].setInputValue(true);
        this.mcu.gpio[4].setInputValue(true);
        this.mcu.gpio[3].setInputValue(true);
        this.mcu.gpio[6].setInputValue(true);
        this.mcu.gpio[5].setInputValue(true);

        this.#sendStrToCDC("execfile(\"" + this.mainFilePath + "\")\r\n");
    }


    #onCDCSerial(data){
        this.onOutput(data);
    }


    async #updateDisplay(){
        let ib = 0;
        for(let row=0; row < this.height; row+=8){
            for(let col=0; col < this.width; col++){
                for(let i=0; i<8; i++){
                    const x = col;
                    const y = row + i;
                    const bit = ((this.mcu.sramView.getUint8(this.displayBufferAddress + ib) & (1 << i)) === 0 ? 0 : 1) * this.displayBrightness;
                    const p = (y * this.width + x) * 4;
                    this.displayPixelBuffer[p] = bit;
                    this.displayPixelBuffer[p+1] = bit;
                    this.displayPixelBuffer[p+2] = bit;
                    this.displayPixelBuffer[p+3] = 255;
                }
        
                ib += 1;
            }
        }
        
        let imageData = new ImageData(this.displayPixelBuffer, this.width, this.height);
        this.context.putImageData(imageData, 0, 0);

        // Send frame to recorder to be scaled and/or rotated then saved to video (if recording)
        this.recorder.sendFrame(imageData);
    }


    async #setupMCU(){
        this.mcu = new RP2040();
        this.mcu.onScreenAddr = (addr) => {this.displayBufferAddress = addr - 0x20000000;};
        this.mcu.onBrightness = (brightness) => {this.displayBrightness = Math.floor((brightness / 127) * 255)};
        this.mcu.onAudioFreq = (freq) => {
            if(this.muted == false){
                this.audioBuzzerNode.frequency.exponentialRampToValueAtTime(freq + 0.0001, this.audioContext.currentTime + 0.03);
            }
        };
        this.mcu.onUpdate = () => {this.#updateDisplay()};

        this.mcu.logger = new ConsoleLogger(LogLevel.Error);

        this.displayPixelBuffer = new Uint8ClampedArray(new ArrayBuffer(this.width * this.height * 4));

        addEventListener("keydown", (event) => {
            let key = event.code;
            if(key == "KeyW"){
                this.mcu.gpio[4].setInputValue(false);
            }
            if(key == "KeyA"){
                this.mcu.gpio[3].setInputValue(false);
            }
            if(key == "KeyS"){
                this.mcu.gpio[6].setInputValue(false);
            }
            if(key == "KeyD"){
                this.mcu.gpio[5].setInputValue(false);
            }
            if(key == "Comma"){
                this.mcu.gpio[24].setInputValue(false);
            }
            if(key == "Period"){
                this.mcu.gpio[27].setInputValue(false);
            }
        });

        addEventListener("keyup", (event) => {
            let key = event.code;
            if(key == "KeyW"){
                this.mcu.gpio[4].setInputValue(true);
            }
            if(key == "KeyA"){
                this.mcu.gpio[3].setInputValue(true);
            }
            if(key == "KeyS"){
                this.mcu.gpio[6].setInputValue(true);
            }
            if(key == "KeyD"){
                this.mcu.gpio[5].setInputValue(true);
            }
            if(key == "Comma"){
                this.mcu.gpio[24].setInputValue(true);
            }
            if(key == "Period"){
                this.mcu.gpio[27].setInputValue(true);
            }
        })

        this.cdc = new USBCDC(this.mcu.usbCtrl);
        this.cdc.onDeviceConnected = () => {this.#onCDCConnected()};
        this.cdc.onSerialData = (data) => {this.#onCDCSerial(data)};

        if(this.bootromData == undefined) this.bootromData = new Uint32Array(await (await fetch("/dist/modules/emulator/bootrom.bin")).arrayBuffer());
        if(this.firmwareData == undefined) this.firmwareData = new Uint8Array(await (await fetch("/dist/modules/emulator/emulator-micropython-firmware-1.19.1.uf2")).arrayBuffer());
        this.mcu.loadBootrom(this.bootromData);
        console.log("Emulator bootrom loaded!");

        let index = 0;
        let lastAddr = 0;
        while (index < this.firmwareData.length) {
            const block = decodeBlock(this.firmwareData.slice(index, index + 512));
            const { flashAddress, payload } = block;
            this.mcu.flash.set(payload, flashAddress - 0x10000000);
            lastAddr = flashAddress;
            index = index + 512;
        }
        console.log("Emulator firmware loaded!");
    }


    async startEmulator(fileList, projectName){
        console.log("Starting emulator...");

        if(this.mcu == undefined){
            this.#setupAudio();
        }else{
            this.mcu.reset();
            this.mcu.stop();
        }
        await this.#setupMCU();

        this.littlefs = new Littlefs();
        await this.littlefs.init();

        // this.littlefs.saveFile("/lib/font3x5.bin", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/font3x5.bin")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/font5x7.bin", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/font5x7.bin")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/font8x8.bin", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/font8x8.bin")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/ssd1306.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/ssd1306.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumby.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumby.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumbyAudioBase.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumbyAudioBase.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumbyButtonBase.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumbyButtonBase.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumbyGraphicsBase.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumbyGraphicsBase.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumbyHardwareBase.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumbyHardwareBase.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumbyLinkBase.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumbyLinkBase.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumbySavesBase.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumbySavesBase.py")).arrayBuffer()));
        // this.littlefs.saveFile("/lib/thumbySpriteBase.py", new Uint8Array(await (await fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Code-Editor/master/ThumbyGames/lib-emulator/thumbySpriteBase.py")).arrayBuffer()));

        this.littlefs.saveFile("/lib/font3x5.bin", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/font3x5.bin")).arrayBuffer()));
        this.littlefs.saveFile("/lib/font5x7.bin", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/font5x7.bin")).arrayBuffer()));
        this.littlefs.saveFile("/lib/font8x8.bin", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/font8x8.bin")).arrayBuffer()));
        this.littlefs.saveFile("/lib/ssd1306.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/ssd1306.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumby.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumby.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumbyAudioBase.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumbyAudioBase.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumbyButtonBase.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumbyButtonBase.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumbyGraphicsBase.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumbyGraphicsBase.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumbyHardwareBase.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumbyHardwareBase.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumbyLinkBase.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumbyLinkBase.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumbySavesBase.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumbySavesBase.py")).arrayBuffer()));
        this.littlefs.saveFile("/lib/thumbySpriteBase.py", new Uint8Array(await (await fetch("/dist/ThumbyFiles/lib-emulator/thumbySpriteBase.py")).arrayBuffer()));


        for(let ifx=0; ifx<fileList.length; ifx++){
            this.littlefs.saveFile("/Games" + fileList[ifx].path, new TextEncoder().encode(fileList[ifx].data));
        }

        this.mainFilePath = "/Games/" + projectName + "/" + projectName + ".py";

        this.mcu.flash.set(this.littlefs.flash, this.littlefs.FS_FLASH_OFFSET);

        // this.mp = new Multiplayer(this.mcu);

        this.mcu.PC = 0x10000000;
        this.mcu.start();
    }
}

export { Emulator };