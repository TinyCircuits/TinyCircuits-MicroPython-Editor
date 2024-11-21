import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import SimulatorCanvas from "./SimulatorCanvas.jsx"
import BusyWorkerSender from "./busy_worker_sender.js";
import dbgconsole from "./dbgconsole";



const SimulatorPanel = forwardRef(function SimulatorPanel(props, ref){
    const {onData} = props;

    // Various button codes mimicing what's in the C engine
    const BUTTON_CODE_A            = 0b0000000000000001;
    const BUTTON_CODE_B            = 0b0000000000000010;
    const BUTTON_CODE_DPAD_UP      = 0b0000000000000100;
    const BUTTON_CODE_DPAD_DOWN    = 0b0000000000001000;
    const BUTTON_CODE_DPAD_LEFT    = 0b0000000000010000;
    const BUTTON_CODE_DPAD_RIGHT   = 0b0000000000100000;
    const BUTTON_CODE_BUMPER_LEFT  = 0b0000000001000000;
    const BUTTON_CODE_BUMPER_RIGHT = 0b0000000010000000;
    const BUTTON_CODE_MENU         = 0b0000000100000000;


    // Refs
    let canvas = useRef(undefined);
    let encoder = useRef(new TextEncoder());

    // Communication link to simulator worker thread
    let sender = useRef(undefined);
    let filesList = useRef([]);
    let runPath = useRef(undefined);


    useImperativeHandle(ref, () => ({
        async runSimulator(newRunFiles, nweRunPath){

            return new Promise((resolve, reject) => {
                dbgconsole("Asking for simulator fs...");
                sender.current.mark("get_fs", (oldFileList) => {
                    filesList.current = [...oldFileList, ...newRunFiles];
                    runPath.current = nweRunPath;
                    sender.current.restart();
                    resolve();
                });
            });

        },

        processChar(char){
            sender.current.setu8("typed", 0, encoder.current.encode(char));
            sender.current.mark("typed", false);
        },

        async getTree(){
            return new Promise((resolve, reject) => {
                dbgconsole("Asking for simulator tree...");
                sender.current.mark("get_tree", (tree) => {
                    resolve(tree);
                });
            });
        }
    }));


    const keydown = (e) => {
        if(e.repeat){
            return;
        }

        let value = sender.current.getu16("pressed_buttons", 0);

        switch(e.key){
            case 'w':        // DPAD UP
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_DPAD_UP);
                sender.current.mark("pressed_buttons", false);
            break;
            case 'a':        // DPAD LEFT
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_DPAD_LEFT);
                sender.current.mark("pressed_buttons", false);
            break;
            case 's':        // DPAD DOWN
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_DPAD_DOWN);
                sender.current.mark("pressed_buttons", false);
            break;
            case 'd':        // DPAD RIGHT
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_DPAD_RIGHT);
                sender.current.mark("pressed_buttons", false);
            break;
            case '.':        // A
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_A);
                sender.current.mark("pressed_buttons", false);
            break;
            case ',':        // B
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_B);
                sender.current.mark("pressed_buttons", false);
            break;
            case "Shift":    // BUMPER LEFT
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_BUMPER_LEFT);
                sender.current.mark("pressed_buttons", false);
            break;
            case ' ':        // BUMPER RIGHT
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_BUMPER_RIGHT);
                sender.current.mark("pressed_buttons", false);
            break;
            case "Enter":    // MENU
                sender.current.setu16("pressed_buttons", 0, value | BUTTON_CODE_MENU);
                sender.current.mark("pressed_buttons", false);
            break;
        }
    }


    const keyup = (e) => {
        if(e.repeat){
            return;
        }

        let value = sender.current.getu16("pressed_buttons", 0);

        switch(e.key){
            case 'w':        // DPAD UP
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_DPAD_UP);
                sender.current.mark("pressed_buttons", false);
            break;
            case 'a':        // DPAD LEFT
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_DPAD_LEFT);
                sender.current.mark("pressed_buttons", false);
            break;
            case 's':        // DPAD DOWN
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_DPAD_DOWN);
                sender.current.mark("pressed_buttons", false);
            break;
            case 'd':        // DPAD RIGHT
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_DPAD_RIGHT);
                sender.current.mark("pressed_buttons", false);
            break;
            case '.':        // A
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_A);
                sender.current.mark("pressed_buttons", false);
            break;
            case ',':        // B
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_B);
                sender.current.mark("pressed_buttons", false);
            break;
            case "Shift":    // BUMPER LEFT
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_BUMPER_LEFT);
                sender.current.mark("pressed_buttons", false);
            break;
            case ' ':        // BUMPER RIGHT
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_BUMPER_RIGHT);
                sender.current.mark("pressed_buttons", false);
            break;
            case "Enter":    // MENU
                sender.current.setu16("pressed_buttons", 0, value & ~BUTTON_CODE_MENU);
                sender.current.mark("pressed_buttons", false);
            break;
        }
    }


    const screenUpdate = async () => {
        dbgconsole("Screen update!");
        await canvas.current.update(sender.current.getu8Data("screen_update"));
    }


    useEffect(() => {
        dbgconsole("Simulator panel init!");

        // Only do this once!
        if(sender.current == undefined){
            sender.current = new BusyWorkerSender("./simulator-worker.js", () => {
                dbgconsole("Simulator worker said it's ready!");
        
                sender.current.registerBufferChannel("pressed_buttons", 2, undefined);
                sender.current.registerBufferChannel("print_update", 0, onData);
                sender.current.registerBufferChannel("typed", 1, undefined);
                sender.current.registerBufferChannel("screen_update", 128*128*2, screenUpdate);
                sender.current.registerBufferChannel("get_tree", 0, undefined);
                sender.current.registerBufferChannel("init_fs", 0, undefined);
                sender.current.registerBufferChannel("get_fs", 0, undefined);
                sender.current.registerBufferChannel("set_progress", 0, (progress) => {
                    window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: progress}}));
                });
                sender.current.registerBufferChannel("end_progress", 0, () => {
                    window.dispatchEvent(new CustomEvent("end_progress"));
                });
                sender.current.registerBufferChannel("upload_files_and_run", 0, undefined);

                if(filesList.current.length == 0){
                    sender.current.send("init_fs", undefined);
                }else{
                    sender.current.send("upload_files_and_run", {filesList:filesList.current, runPath:runPath.current});
                }
                
            });
        }

        window.addEventListener("keydown", keydown, false);
        window.addEventListener("keyup", keyup, false);
    }, [])


    return(
        <div ref={this} className="w-full h-full flex justify-center items-center bg-base-200">
            <SimulatorCanvas ref={canvas}/>
        </div>
    );
});



// const SimulatorPanel = forwardRef(function SimulatorPanel(props, ref){

//     let pressedButtonsBuffer = useRef(undefined);
//     let pressedButtonsArray = useRef(undefined);
//     let screenBuffer = useRef(undefined);
//     let stopBuffer = useRef(undefined);
//     let stopArray = useRef(undefined);

//     let typedCharsList = useRef([]);            // List that always grows while waiting for simulator worker to consume chars in buffer
//     const typedCharsBufferSize = 32;
//     let typedCharsBuffer = useRef(undefined);    // Finite shared buffer that `typedChars` are placed in for the simulator work to consume on MicroPython vm hook callback
//     let typedCharsArray = useRef(undefined);
//     let getTreeResolve = useRef(undefined);

//     let filesToSimulate = useRef(undefined);
//     let pathToSimulate = useRef(undefined);
//     let ran = useRef(false);


//     let worker = useRef(undefined);


//     const setupWorker = async () => {
//         return new Promise((resolve, reject) => {
//             dbgconsole("Starting simulator worker!");
//             worker.current = new Worker("./simulator-worker.js", { type: "module" });

//             worker.current.onerror = (data) => {
//                 console.error(data);
//             };

//             worker.current.onmessage = async (e) => {
//                 if(e.data.message_type == "screen_update"){
//                     await simulatorCanvasRef.current.update(new Uint8Array(screenBuffer.current));
//                 }else if(e.data.message_type == "print_update"){
//                     props.onData(e.data.value);
//                 }else if(e.data.message_type == "ready_for_more_typed_chars"){
//                     tryFillTypedCharsBuffer();
//                 }else if(e.data.message_type == "ready"){
//                     worker.current.postMessage({message_type:"stop_buffer_set", value:stopBuffer.current});
//                     worker.current.postMessage({message_type:"screen_buffer_set", value:screenBuffer.current});
//                     worker.current.postMessage({message_type:"pressed_buttons_buffer_set", value:pressedButtonsBuffer.current});
//                     worker.current.postMessage({message_type:"typed_chars_buffer_set", value:typedCharsBuffer.current});
//                     resolve();
//                 }else if(e.data.message_type == "fs"){
//                     dbgconsole("Got simulator files to restore", e.data.value);
//                     dbgconsole("Also need to write these files", filesToSimulate.current)
//                     await setupWorker();

//                     worker.current.postMessage({message_type:"files", value:filesToSimulate.current});
//                     worker.current.postMessage({message_type:"files", value:e.data.value});
//                     worker.current.postMessage({message_type:"run", value:pathToSimulate.current});
                    
//                     // ran.current = true;
//                 }else if(e.data.message_type == "tree"){
//                     getTreeResolve.current(e.data.value);
//                 }else if(e.data.message_type == "worker_set_progress"){
//                     window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: e.data.value}}));
//                 }else if(e.data.message_type == "worker_end_progress"){
//                     window.dispatchEvent(new CustomEvent("end_progress"));
//                 }
//             };
//         });
//     }


//     const stopWorker = () => {
//         worker.current.postMessage({message_type:"stop"});
//         stopArray[0] = 1;
//         ran.current = false;
//     }


//     const tryFillTypedCharsBuffer = () => {
//         // If the first element is zero, that means the worker,
//         // used everything in the buffer, try to refill it
//         if(typedCharsArray.current[0] == 0){
//             let index = 1;

//             // Zero the entire array since that's what the worker looks for
//             // to stop processing characters and there could be old data
//             for(let i=0; i<typedCharsBufferSize; i++){
//                 typedCharsArray.current[i] = 0;
//             }

//             if(typedCharsList.current.length != 0){
//                 // Only set this to one if these actually is data
//                 // so the worker knows to consume all data after
//                 typedCharsArray.current[0] = 1;
//             }

//             // Put the typed and buffer characters into the shared array
//             while(index < typedCharsBufferSize && typedCharsList.current.length != 0){
//                 let char = typedCharsList.current.shift();
//                 typedCharsArray.current[index] = encoder.current.encode(char)[0];
//                 index += 1;
//             }
//         }

//         // This should really only be called if the simulator is not actually running anything: TODO
//         if(ran.current == false) worker.current.postMessage({message_type:"typed"});
//     }


//     useImperativeHandle(ref, () => ({
//         
//     }));

//     useEffect(() => {
//         dbgconsole("Simulator init!");

//         // https://stackoverflow.com/a/77908357
//         pressedButtonsBuffer.current = new SharedArrayBuffer(2);
//         pressedButtonsArray.current = new Uint16Array(pressedButtonsBuffer.current);
//         screenBuffer.current = new SharedArrayBuffer((128*128*2));

//         stopBuffer.current = new SharedArrayBuffer(1);
//         stopArray.current = new Uint8Array(stopBuffer.current);

//         typedCharsBuffer.current = new SharedArrayBuffer(typedCharsBufferSize);
//         typedCharsArray.current = new Uint8Array(typedCharsBuffer.current);



//         setupWorker();
//     }, [])

//     return(
//         <div ref={this} className="w-full h-full flex justify-center items-center bg-base-200">
//             <SimulatorCanvas ref={simulatorCanvasRef}/>
//         </div>
//     );
// });


export default SimulatorPanel;