import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import SimulatorCanvas from "./SimulatorCanvas.jsx"
import BusyWorkerSender from "./busy_worker_sender.js";
import dbgconsole from "./dbgconsole";
import { Button, Select } from "react-daisyui";



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

    let audioContext = useRef(undefined);
    let audioProcessorWorkletNode = useRef(undefined);

    let mediaStream = useRef(undefined);
    let mediaRecorder = useRef(undefined);
    let recordedChunks = useRef(undefined);

    const [recording, setRecording] = useState(false);
    const [simulatorScale, setSimulatorScale] = useState(1);
    const [simulatorRotation, setSimulatorRotation] = useState(0);


    useImperativeHandle(ref, () => ({
        async runSimulator(newRunFiles, newRunPath){
            // audioContext.current = new AudioContext({latencyHint:"playback", sampleRate:22050});
            // await audioContext.current.audioWorklet.addModule("audio-processor.js");
            // audioProcessorWorkletNode.current = new AudioWorkletNode(audioContext.current, "audio-processor");
            
            // const gainNode = audioContext.current.createGain();

            // gainNode
            // .connect(audioProcessorWorkletNode.current)
            // .connect(audioContext.current.destination);

            return new Promise((resolve, reject) => {
                dbgconsole("Asking for simulator fs...");
                sender.current.mark("get_fs", (oldFileList) => {
                    filesList.current = [...oldFileList, ...newRunFiles];
                    runPath.current = newRunPath;
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


    const audioUpdate = async () => {

    }


    useEffect(() => {
        console.log("Simulator panel init!");

        // Only do this once!
        if(sender.current == undefined){
            console.log("Getting worker ready!");

            sender.current = new BusyWorkerSender("./simulator-worker.js", () => {
                console.log("Simulator worker said it's ready!");
        
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
                sender.current.registerBufferChannel("main_needs_audio", 128, audioUpdate);

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


    const handleScreenshot = () => {
        var link = document.createElement('a');
        link.download = 'simulator_screenshot.png';
        link.href = canvas.current.toDataURL();
        link.click();
    }


    const handleRecording = () => {
        if(recording){
            setRecording(false);
            if(mediaRecorder.current){
                mediaRecorder.current.stop()
            }
        }else{
            setRecording(true);
            
            // Setup for recording
            // https://w3c.github.io/mediacapture-record/#example1
            mediaStream.current = canvas.current.captureStream();
            mediaRecorder.current = new MediaRecorder(mediaStream.current, {mimeType: "video/mp4;codecs=avc1"});
            recordedChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                recordedChunks.current.push(event.data);
                console.log(event.data);
          
                // after stop `dataavilable` event run one more time to push last chunk
                if(mediaRecorder.current.state === 'recording'){
                    mediaRecorder.current.stop();
                }
            }

            mediaRecorder.current.onstop = (event) => {
                var blob = new Blob(recordedChunks.current, {type: "video/mp4" });
                var url = URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.download = 'simulator_video.mp4';
                link.href = url;
                link.click();
                window.URL.revokeObjectURL(url);
            }

            mediaRecorder.current.start();
        }
    }


    const handleSimulatorScale = (scale) => {
        setSimulatorScale(scale);
        canvas.current.setTransformation(scale, simulatorRotation);
    }


    const handleSimulatorRotation = () => {
        let newSimulatorRotation = simulatorRotation + 90;

        if(newSimulatorRotation >= 360){
            newSimulatorRotation = 0;
        }

        setSimulatorRotation(newSimulatorRotation);

        canvas.current.setTransformation(simulatorScale, newSimulatorRotation);
    }


    return(
        <div ref={this} className="w-full h-full flex justify-center bg-base-200">
            <div className="w-min h-full flex flex-col justify-center items-center">
                <SimulatorCanvas ref={canvas}/>
                <div className="w-full h-16 flex justify-center items-center">
                    <Select className="mx-1" size="sm" value={simulatorScale} onChange={(event) => {handleSimulatorScale(event.target.value)}}>
                        <Select.Option value={'default'} disabled>
                            Record Resolution:
                        </Select.Option>
                        <Select.Option value={1}>1x: 128x128px</Select.Option>
                        <Select.Option value={2}>2x: 256x256px</Select.Option>
                        <Select.Option value={4}>4x: 512x512px</Select.Option>
                        <Select.Option value={8}>8x: 1024x1024px</Select.Option>
                    </Select>

                    <Button color="secondary" size="sm" className="ml-2 mr-1" onClick={handleSimulatorRotation} title="Rotate simulator view">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
                        </svg>
                        {simulatorRotation}°
                    </Button>

                    <Button color="secondary" size="sm" className="mx-2" onClick={handleScreenshot} title="Take a simulator screenshot and download it">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                        </svg>
                        Screenshot
                    </Button>

                    <Button color="secondary" size="sm" className="ml-1" onClick={handleRecording} title="Start or stop recording the simulator. Video auto downloads when recording is stopped">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 0 0 1.28-.53V4.75Z" />
                        </svg>
                        Record
                        <div className={"w-4 h-4 rounded-full " + (recording ? "bg-red-600" : "bg-gray-700")}>

                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
});


export default SimulatorPanel;