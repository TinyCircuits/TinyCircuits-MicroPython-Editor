import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import SimulatorCanvas from "./SimulatorCanvas.jsx"

const SimulatorPanel = forwardRef(function SimulatorPanel(props, ref){
    let simulatorCanvasRef = useRef(undefined);

    let pressedButtonsBuffer = useRef(undefined);
    let pressedButtonsArray = useRef(undefined);
    let screenBuffer = useRef(undefined);
    let stopBuffer = useRef(undefined);
    let stopArray = useRef(undefined);

    let typedCharsList = useRef([]);            // List that always grows while waiting for simulator worker to consume chars in buffer
    const typedCharsBufferSize = 32;
    let typedCharsBuffer = useRef(undefined);    // Finite shared buffer that `typedChars` are placed in for the simulator work to consume on MicroPython vm hook callback
    let typedCharsArray = useRef(undefined);
    let getTreeResolve = useRef(undefined);

    let filesToSimulate = useRef(undefined);
    let pathToSimulate = useRef(undefined);
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


    const setupWorker = async () => {
        return new Promise((resolve, reject) => {
            console.log("Starting simulator worker!");
            worker.current = new Worker("./simulator-worker.js", { type: "module" });

            worker.current.onerror = (data) => {
                console.error(data);
            };

            worker.current.onmessage = async (e) => {
                if(e.data.message_type == "screen_update"){
                    await simulatorCanvasRef.current.update(new Uint8Array(screenBuffer.current));
                }else if(e.data.message_type == "print_update"){
                    props.onData(e.data.value);
                }else if(e.data.message_type == "ready_for_more_typed_chars"){
                    tryFillTypedCharsBuffer();
                }else if(e.data.message_type == "ready"){
                    worker.current.postMessage({message_type:"stop_buffer_set", value:stopBuffer.current});
                    worker.current.postMessage({message_type:"screen_buffer_set", value:screenBuffer.current});
                    worker.current.postMessage({message_type:"pressed_buttons_buffer_set", value:pressedButtonsBuffer.current});
                    worker.current.postMessage({message_type:"typed_chars_buffer_set", value:typedCharsBuffer.current});
                    resolve();
                }else if(e.data.message_type == "fs"){
                    console.log("Got simulator files to restore", e.data.value);
                    console.log("Also need to write these files", filesToSimulate.current)
                    await setupWorker();

                    worker.current.postMessage({message_type:"files", value:filesToSimulate.current});
                    worker.current.postMessage({message_type:"files", value:e.data.value});
                    worker.current.postMessage({message_type:"run", value:pathToSimulate.current});
                    
                    // ran.current = true;
                }else if(e.data.message_type == "tree"){
                    getTreeResolve.current(e.data.value);
                }else if(e.data.message_type == "worker_set_progress"){
                    window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: e.data.value}}));
                }else if(e.data.message_type == "worker_end_progress"){
                    window.dispatchEvent(new CustomEvent("end_progress"));
                }
            };
        });
    }


    const stopWorker = () => {
        worker.current.postMessage({message_type:"stop"});
        stopArray[0] = 1;
        ran.current = false;
    }


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
            filesToSimulate.current = files;
            pathToSimulate.current = pathToRun;
            stopWorker();
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
    }));

    useEffect(() => {
        console.log("Simulator init!");

        // https://stackoverflow.com/a/77908357
        pressedButtonsBuffer.current = new SharedArrayBuffer(2);
        pressedButtonsArray.current = new Uint16Array(pressedButtonsBuffer.current);
        screenBuffer.current = new SharedArrayBuffer((128*128*2));

        stopBuffer.current = new SharedArrayBuffer(1);
        stopArray.current = new Uint8Array(stopBuffer.current);

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
                case '.':        // A
                    pressedButtonsArray.current[0] |= BUTTON_CODE_A;
                break;
                case ',':        // B
                    pressedButtonsArray.current[0] |= BUTTON_CODE_B;
                break;
                case "Shift":    // BUMPER LEFT
                    pressedButtonsArray.current[0] |= BUTTON_CODE_BUMPER_LEFT;
                break;
                case ' ':        // BUMPER RIGHT
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
                case '.':        // A
                    pressedButtonsArray.current[0] &= ~BUTTON_CODE_A;
                break;
                case ',':        // B
                    pressedButtonsArray.current[0] &= ~BUTTON_CODE_B;
                break;
                case "Shift":    // BUMPER LEFT
                    pressedButtonsArray.current[0] &= ~BUTTON_CODE_BUMPER_LEFT;
                break;
                case ' ':        // BUMPER RIGHT
                    pressedButtonsArray.current[0] &= ~BUTTON_CODE_BUMPER_RIGHT;
                break;
                case "Enter":    // MENU
                    pressedButtonsArray.current[0] &= ~BUTTON_CODE_MENU;
                break;
            }
        }, false);

        setupWorker();
    }, [])

    return(
        <div ref={this} className="w-full h-full flex justify-center items-center bg-base-200">
            <SimulatorCanvas ref={simulatorCanvasRef}/>
        </div>
    );
});


export default SimulatorPanel;