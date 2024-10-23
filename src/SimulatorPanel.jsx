import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

const SimulatorPanel = forwardRef(function SimulatorPanel(props, ref){
    let canvasRef = useRef(undefined);
    let canvas = useRef(undefined);
    let ctx = useRef(undefined);

    let pressedButtonsBuffer = useRef(undefined);
    let pressedButtonsArray = useRef(undefined);
    let screenBuffer = useRef(undefined);
    let screenArray = useRef(undefined);

    let typedCharsList = useRef([]);            // List that always grows while waiting for simulator worker to consume chars in buffer
    const typedCharsBufferSize = 32;
    let typedCharsBuffer = useRef(undefined);    // Finite shared buffer that `typedChars` are placed in for the simulator work to consume on MicroPython vm hook callback
    let typedCharsArray = useRef(undefined);
    let getTreeResolve = useRef(undefined);

    let ran = useRef(false);

    let encoder = useRef(new TextEncoder());

    const BUTTON_CODE_A            = 0b0000000000000001;
    const BUTTON_CODE_B            = 0b0000000000000010;
    const BUTTON_CODE_DPAD_UP      = 0b0000000000000100;
    const BUTTON_CODE_DPAD_DOWN    = 0b0000000000001000;
    const BUTTON_CODE_DPAD_LEFT    = 0b0000000000010000;
    const BUTTON_CODE_DPAD_RIGHT   = 0b0000000000100000;
    const BUTTON_CODE_BUMPER_LEFT  = 0b0000000001000000;
    const BUTTON_CODE_BUMPER_RIGHT = 0b0000000010000000;
    const BUTTON_CODE_MENU         = 0b0000000100000000;

    let worker = useRef(undefined);

    const tryFillTypedCharsBuffer = () => {
        // If the first element is zero, that means the worker,
        // used everything in the buffer, try to refill it
        if(typedCharsArray.current[0] == 0){
            let index = 1;

            // Zero the entire array since that's what the worker looks for
            // to stop processing characters and there could be old data
            for(let i=0; i<typedCharsBufferSize; i++){
                typedCharsArray.current[i] = 0;
            }

            if(typedCharsList.current.length != 0){
                // Only set this to one if these actually is data
                // so the worker knows to consume all data after
                typedCharsArray.current[0] = 1;
            }

            // Put the typed and buffer characters into the shared array
            while(index < typedCharsBufferSize && typedCharsList.current.length != 0){
                let char = typedCharsList.current.shift();
                typedCharsArray.current[index] = encoder.current.encode(char)[0];
                index += 1;
            }
        }

        // This should really only be called if the simulator is not actually running anything: TODO
        if(ran.current == false) worker.current.postMessage({message_type:"typed"});
    }

    useImperativeHandle(ref, () => ({
        runSimulator(files, pathToRun){
            worker.current.postMessage({message_type:"files", value:files});
            worker.current.postMessage({message_type:"run", value:pathToRun});
            ran.current = true;
        },

        processChar(char){
            typedCharsList.current.push(char);
            tryFillTypedCharsBuffer();
        },

        async getTree(){
            return new Promise((resolve, reject) => {
                worker.current.postMessage({message_type:"tree", value:undefined});
                getTreeResolve.current = resolve;
            });
        }
    }))

    useEffect(() => {
        if(canvas.current == undefined){
            console.log("Simulator init!");

            canvas.current = canvasRef.current;
            ctx.current = canvas.current.getContext("2d");

            canvas.current.style.cssText = "width:512px; height:512px; image-rendering:optimizeQuality; image-rendering:-moz-crisp-edges; image-rendering:-webkit-optimize-contrast; image-rendering:-o-crisp-edges; image-rendering:pixelated; -ms-interpolation-mode:nearest-neighbor;";

            ctx.current.imageSmoothingEnabled = false;
            ctx.current.mozImageSmoothingEnabled = false;
            ctx.current.oImageSmoothingEnabled = false;
            ctx.current.webkitImageSmoothingEnabled = false;
            ctx.current.msImageSmoothingEnabled = false;

            ctx.current.fillStyle = "black";
            ctx.current.fillRect(0, 0, 128, 128);

            // https://stackoverflow.com/a/77908357
            pressedButtonsBuffer.current = new SharedArrayBuffer(2);
            pressedButtonsArray.current = new Uint16Array(pressedButtonsBuffer.current);
            screenBuffer.current = new SharedArrayBuffer((128*128*2));
            screenArray.current = new Uint8ClampedArray(128*128 * 4);    // Each pixel is 4 bytes, R,G,B,A

            typedCharsBuffer.current = new SharedArrayBuffer(typedCharsBufferSize);
            typedCharsArray.current = new Uint8Array(typedCharsBuffer.current);

            window.addEventListener("keydown", (e) => {
                if (e.repeat) return;
                switch(e.key){
                    case 'w':        // DPAD UP
                        pressedButtonsArray.current[0] |= BUTTON_CODE_DPAD_UP;
                    break;
                    case 'a':        // DPAD LEFT
                        pressedButtonsArray.current[0] |= BUTTON_CODE_DPAD_LEFT;
                    break;
                    case 's':        // DPAD DOWN
                        pressedButtonsArray.current[0] |= BUTTON_CODE_DPAD_DOWN;
                    break;
                    case 'd':        // DPAD RIGHT
                        pressedButtonsArray.current[0] |= BUTTON_CODE_DPAD_RIGHT;
                    break;
                    case '.':   // A
                        pressedButtonsArray.current[0] |= BUTTON_CODE_A;
                    break;
                    case ',':    // B
                        pressedButtonsArray.current[0] |= BUTTON_CODE_B;
                    break;
                    case "Shift":   // BUMPER LEFT
                        pressedButtonsArray.current[0] |= BUTTON_CODE_BUMPER_LEFT;
                    break;
                    case ' ':    // BUMPER RIGHT
                        pressedButtonsArray.current[0] |= BUTTON_CODE_BUMPER_RIGHT;
                    break;
                    case "Enter":    // MENU
                        pressedButtonsArray.current[0] |= BUTTON_CODE_MENU;
                    break;
                }
            }, false);

            window.addEventListener("keyup", (e) => {
                if (e.repeat) return;
                switch(e.key){
                    case 'w':        // DPAD UP
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_DPAD_UP;
                    break;
                    case 'a':        // DPAD LEFT
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_DPAD_LEFT;
                    break;
                    case 's':        // DPAD DOWN
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_DPAD_DOWN;
                    break;
                    case 'd':        // DPAD RIGHT
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_DPAD_RIGHT;
                    break;
                    case '.':   // A
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_A;
                    break;
                    case ',':    // B
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_B;
                    break;
                    case "Shift":   // BUMPER LEFT
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_BUMPER_LEFT;
                    break;
                    case ' ':    // BUMPER RIGHT
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_BUMPER_RIGHT;
                    break;
                    case "Enter":    // MENU
                        pressedButtonsArray.current[0] &= ~BUTTON_CODE_MENU;
                    break;
                }
            }, false);

            console.log("Starting simulator worker!");
            worker.current = new Worker("./simulator-worker.js", { type: "module" });

            worker.current.onerror = (data) => {
                console.error(data);
            };
  
            worker.current.onmessage = async (e) => {
                if(e.data.message_type == "screen_update"){
                    let buffer = new Uint8Array(screenBuffer.current);

                    for(let ipx=0; ipx<128*128; ipx++){
                        let RGB565_16BIT = 0;
                        RGB565_16BIT |= (buffer[(ipx*2)+1]) << 8;
                        RGB565_16BIT |= (buffer[(ipx*2)]) << 0;

                        let R_5BIT = (RGB565_16BIT >> 11) & 0b00011111;
                        let G_6BIT = (RGB565_16BIT >> 5)  & 0b00111111;
                        let B_5BIT = (RGB565_16BIT >> 0)  & 0b00011111;

                        screenArray.current[(ipx*4)] =   R_5BIT << 3;
                        screenArray.current[(ipx*4)+1] = G_6BIT << 2;
                        screenArray.current[(ipx*4)+2] = B_5BIT << 3;
                        screenArray.current[(ipx*4)+3] = 255;
                    }

                    // let imageData = new ImageData(screenArray.current, 128, 128);
                    // let imageBitmap = await createImageBitmap(imageData, 0, 0, 128, 128);
                    // ctx.current.drawImage(imageBitmap, 0, 0);

                    let imageData = new ImageData(screenArray.current, 128, 128);
                    ctx.current.putImageData(imageData, 0, 0);
                }else if(e.data.message_type == "print_update"){
                    props.onData(e.data.value);
                }else if(e.data.message_type == "ready_for_more_typed_chars"){
                    tryFillTypedCharsBuffer();
                }else if(e.data.message_type == "ready"){
                    worker.current.postMessage({message_type:"screen_buffer_set", value:screenBuffer.current});
                    worker.current.postMessage({message_type:"pressed_buttons_buffer_set", value:pressedButtonsBuffer.current});
                    worker.current.postMessage({message_type:"typed_chars_buffer_set", value:typedCharsBuffer.current});
                }else if(e.data.message_type == "tree"){
                    getTreeResolve.current(e.data.value);
                }
            };
        }
    }, [])

    return(
        <div ref={this} className="w-full h-full flex justify-center items-center bg-base-200">
            <canvas ref={canvasRef} width="128" height="128" className="w-96 aspect-square">
                Canvas that displays simulator frames
            </canvas>
        </div>
    );
});


export default SimulatorPanel;