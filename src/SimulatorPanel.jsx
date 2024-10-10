import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

const SimulatorPanel = forwardRef(function SimulatorPanel(props, ref){
    let canvasRef = useRef(undefined);
    let canvas = useRef(undefined);
    let ctx = useRef(undefined);

    let pressedButtonsBuffer = useRef(undefined);
    let pressedButtons = useRef(undefined);
    let screenBuffer = useRef(undefined);
    let screen = useRef(undefined);

    let worker = useRef(undefined);

    const BUTTON_CODE_A            = 0b0000000000000001;
    const BUTTON_CODE_B            = 0b0000000000000010;
    const BUTTON_CODE_DPAD_UP      = 0b0000000000000100;
    const BUTTON_CODE_DPAD_DOWN    = 0b0000000000001000;
    const BUTTON_CODE_DPAD_LEFT    = 0b0000000000010000;
    const BUTTON_CODE_DPAD_RIGHT   = 0b0000000000100000;
    const BUTTON_CODE_BUMPER_LEFT  = 0b0000000001000000;
    const BUTTON_CODE_BUMPER_RIGHT = 0b0000000010000000;
    const BUTTON_CODE_MENU         = 0b0000000100000000;

    useImperativeHandle(ref, () => ({
        runSimulator(){
            console.log(BUTTON_CODE_A);
        }
    }))

    useEffect(() => {
        if(canvas.current == undefined){
            console.log("Simulator init!");

            canvas.current = canvasRef.current;
            ctx.current = canvas.current.getContext("2d");

            ctx.current.imageSmoothingEnabled = false;
            ctx.current.mozImageSmoothingEnabled = false;
            ctx.current.oImageSmoothingEnabled = false;
            ctx.current.webkitImageSmoothingEnabled = false;
            ctx.current.msImageSmoothingEnabled = false;

            ctx.current.fillStyle = "black";
            ctx.current.fillRect(0, 0, 128, 128);

            // https://stackoverflow.com/a/77908357
            pressedButtonsBuffer.current = new SharedArrayBuffer(2);
            pressedButtons.current = new Uint16Array(pressedButtonsBuffer.current)
            screenBuffer.current = new SharedArrayBuffer((128*128*2));
            screen.current = new Uint8ClampedArray(128*128 * 4);    // Each pixel is 4 bytes, R,G,B,A

            window.addEventListener("keydown", (e) => {
                if (e.repeat) return;
                switch(e.key){
                    case 'w':        // DPAD UP
                        pressedButtons.current[0] |= BUTTON_CODE_DPAD_UP;
                    break;
                    case 'a':        // DPAD LEFT
                        pressedButtons.current[0] |= BUTTON_CODE_DPAD_LEFT;
                    break;
                    case 's':        // DPAD DOWN
                        pressedButtons.current[0] |= BUTTON_CODE_DPAD_DOWN;
                    break;
                    case 'd':        // DPAD RIGHT
                        pressedButtons.current[0] |= BUTTON_CODE_DPAD_RIGHT;
                    break;
                    case '.':   // A
                        pressedButtons.current[0] |= BUTTON_CODE_A;
                    break;
                    case ',':    // B
                        pressedButtons.current[0] |= BUTTON_CODE_B;
                    break;
                    case "Shift":   // BUMPER LEFT
                        pressedButtons.current[0] |= BUTTON_CODE_BUMPER_LEFT;
                    break;
                    case ' ':    // BUMPER RIGHT
                        pressedButtons.current[0] |= BUTTON_CODE_BUMPER_RIGHT;
                    break;
                    case "Enter":    // MENU
                        pressedButtons.current[0] |= BUTTON_CODE_MENU;
                    break;
                }
            }, false);

            window.addEventListener("keyup", (e) => {
                if (e.repeat) return;
                switch(e.key){
                    case 'w':        // DPAD UP
                        pressedButtons.current[0] &= ~BUTTON_CODE_DPAD_UP;
                    break;
                    case 'a':        // DPAD LEFT
                        pressedButtons.current[0] &= ~BUTTON_CODE_DPAD_LEFT;
                    break;
                    case 's':        // DPAD DOWN
                        pressedButtons.current[0] &= ~BUTTON_CODE_DPAD_DOWN;
                    break;
                    case 'd':        // DPAD RIGHT
                        pressedButtons.current[0] &= ~BUTTON_CODE_DPAD_RIGHT;
                    break;
                    case '.':   // A
                        pressedButtons.current[0] &= ~BUTTON_CODE_A;
                    break;
                    case ',':    // B
                        pressedButtons.current[0] &= ~BUTTON_CODE_B;
                    break;
                    case "Shift":   // BUMPER LEFT
                        pressedButtons.current[0] &= ~BUTTON_CODE_BUMPER_LEFT;
                    break;
                    case ' ':    // BUMPER RIGHT
                        pressedButtons.current[0] &= ~BUTTON_CODE_BUMPER_RIGHT;
                    break;
                    case "Enter":    // MENU
                        pressedButtons.current[0] &= ~BUTTON_CODE_MENU;
                    break;
                }
            }, false);

            console.log("Starting simulator worker!");
            worker.current = new Worker("simulator-worker.js", { type: "module" });

            worker.current.onerror = (data) => {
                console.error(data);
            };
  
            worker.current.onmessage = (e) => {
            
                let buffer = new Uint8Array(screenBuffer.current);

                for(let ipx=0; ipx<128*128; ipx++){
                    let RGB565_16BIT = 0;
                    RGB565_16BIT |= (buffer[(ipx*2)+1]) << 8;
                    RGB565_16BIT |= (buffer[(ipx*2)]) << 0;

                    let R_5BIT = (RGB565_16BIT >> 11) & 0b00011111;
                    let G_6BIT = (RGB565_16BIT >> 5)  & 0b00111111;
                    let B_5BIT = (RGB565_16BIT >> 0)  & 0b00011111;

                    screen.current[(ipx*4)] =   R_5BIT << 3;
                    screen.current[(ipx*4)+1] = G_6BIT << 2;
                    screen.current[(ipx*4)+2] = B_5BIT << 3;
                    screen.current[(ipx*4)+3] = 255;
                }

                let imageData = new ImageData(screen.current, 128, 128);

                // Draw image data to the canvas
                ctx.current.putImageData(imageData, 0, 0);
            };

            worker.current.postMessage(screenBuffer.current);
            worker.current.postMessage(pressedButtonsBuffer.current);
        }
    }, [])

    return(
        <div ref={this} className="w-full h-full flex justify-center items-center">
            <canvas ref={canvasRef} width="128" height="128" className="w-96 aspect-square" style={{imageRendering:"optimizeQuality; -moz-crisp-edges; -webkit-optimize-contrast; -o-crisp-edges; pixelated"}}>
                Canvas that displays simulator frames
            </canvas>
        </div>
    );
});


export default SimulatorPanel;