import { useState, useRef, Children, useCallback, useEffect} from 'react'
import './App.css'

import './tailwind_output.css'
import { Theme, Button, Modal, Form, Checkbox, Progress, Input, Join, Accordion, Pagination} from 'react-daisyui'
import FilesPanel from './FilesPanel.jsx'
import TabPanel from './TabPanel.jsx'
import TerminalPanel from './TerminalPanel.jsx'
import SimulatorPanel from './SimulatorPanel.jsx'
import CodePanel from './CodePanel.jsx'

import React from 'react';

import ComputerFiles from './computer_files.js'
import DeviceFiles from './device_files.js'
import WebSerialOverride from './WebSerialOverride.js'


import{
    getPanelElement,
    getPanelGroupElement,
    getResizeHandleElement,
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from "react-resizable-panels";





function App(props){

    const [tree, setTree] = useState([]);
    const [pathCheckedToRun, setPathCheckedToRun] = useState("");   // The path that was checked to run, can be a folder or file
    let allCheckedPaths = useRef([]);                               // A list of all the paths checked to run under `pathCheckedToRun` (including it)   

    let [files, setFiles] = useState(undefined);
    const [editorTabsData, setEditorTabsData] = useState([]);
    const [choseComputer, setChoseComputer] = useState(undefined);
    let editorValues = useRef({});  // Use ref so that rerender does not happen when saving editor states

    // The active tab key
    const [activeEditorTabKey, setActiveEditorTabKey] = useState(0);
    const [activeTerminalTabKey, setActiveTerminalTabKey] = useState("Device");

    const [currentMainPanel, setCurrentMainPanel] = useState("Code");

    const [errorMsg, setErrorMsg] = useState("No error, you shouldn't see this...");
    const [errorMsgDetails, setErrorMsgDetails] = useState("No error details, you shouldn't see this...");

    const errorModalRef = useRef(null);
    const choosePLatformModalRef = useRef(null);
    const xtermRefDevice = useRef(null);
    const xtermRefSimulator = useRef(null);

    let simulatorRef = useRef(undefined);

    const [isSerialConnected, setIsSerialConnected] = useState(false);
    const setIsSerialConnectedWrapper = (value) => {
        setIsSerialConnected(value);

        // Reset all of these so that the editor is reset
        if(value == false && (choseComputer == false || choseComputer == undefined)){
            editorValues.current = {};
            setTree([]);
            setEditorTabsData([]);
            setChoseComputer(undefined);
        }
    }

    // let serial = undefined;
    let serial = useRef(undefined);

    function onDeviceTerminalType(value){
        serial.current.write(value);
    }

    function onSimulatorTerminalType(value){
        simulatorRef.current.addTypedChar(value);
    }

    const [terminalTabsData, setTerminalTabsData] = useState([
        { id: "Device", saved:true, children: {title:'Device Terminal', component:<TerminalPanel ref={xtermRefDevice} onData={onDeviceTerminalType} startMessage="Device Terminal"/>} },
        { id: "Simulator", saved:true, children: {title:'Simulator Terminal', component:<TerminalPanel ref={xtermRefSimulator} onData={onSimulatorTerminalType} startMessage="Simulator Terminal"/>}},
    ]);

    const onCodeEditorChanged = (path) => {
        // When an editor has its content changed, loop through all editor tabs
        // and add/set a `saved` attribute to `false` to show indicate that the
        // tab is not saved. Will be rendered with a `*`
        for(let i=0; i<editorTabsData.length; i++){
            if(editorTabsData[i].id == path){
                editorTabsData[i].saved = false;
                
                // Not sure why need to copy previous for other tabs to not disappear...
                // https://stackoverflow.com/questions/70948463/react-stale-state-issue-with-callback-passed-to-children
                // https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                setEditorTabsData((prevEditorTabsData) => {
                    return [...prevEditorTabsData];
                });
                break;
            }
        }
    }

    const onCodeEditorSaved = (path, valueToSave) => {
        files.saveFile(path, valueToSave).then(() => {
            // Go through and find the editor tab being saved based on `path` and tab `id`.
            // Set tab `saved` flag to `true` so that the `*` is removed 
            for(let i=0; i<editorTabsData.length; i++){
                if(editorTabsData[i].id == path){
                    editorTabsData[i].saved = true;
                    
                    // Not sure why need to copy previous for other tabs to not disappear...
                    // https://stackoverflow.com/questions/70948463/react-stale-state-issue-with-callback-passed-to-children
                    // https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                    setEditorTabsData((prevEditorTabsData) => {
                        return [...prevEditorTabsData];
                    });
                    break;
                }
            }
        });
    }

    // When a file in the files panel is opened, this gets called to add
    // a new code editor to `editorTabsData`. The code editor tab will need
    // access to `fileDataGetter` and `fileDataSetter` for getting and
    // setting data from/to the file on a computer or device
    const addCodeEditor = (path, name) => {
        // First, see if an editor tab has an `id` with the same path,
        // if so, do not add it but do focus it
        for(let i=0; i<editorTabsData.length; i++){
            if(editorTabsData[i].id == path){
                setActiveEditorTabKey(path); // Focus it
                return;
            }
        }

        // Open file from whatever the current file handler class is,
        // then add it to all the current editor values for persistance
        // without rerender, then add the editor to the tabs and rerender
        // the tabs
        files.openFile(path).then((content) => {
            editorValues.current[path] = new TextDecoder().decode(content);
            editorTabsData.push({ id:path, saved:true, children:{title:name, component:<CodePanel path={path} editorValues={editorValues.current} onCodeEditorChanged={onCodeEditorChanged} onCodeEditorSaved={onCodeEditorSaved}/>} })
            setEditorTabsData([...editorTabsData]);
            setActiveEditorTabKey(path);
        })
    }


    function onSerialData(value){
        xtermRefDevice.current.write(value);
    }

    function onSerialActivity(){
        
    }

    function onSerialDisconnect(){
        console.log("Serial disconnect")
        serial.current.disconnect();
        this.setIsSerialConnectedWrapper(false);
    }

    const connectSerial = async () => {
        if(serial.current == undefined){
            reportError("Serial not defined. You are likely not using a Chromium based browser. Please use a browser like Google Chrome or Microsoft Edge.");
        }else{
            try{
                await serial.current.requestAccess(0x2E8A, 0x0005);

                try{
                    await serial.current.connect();
                }catch(error){
                    // https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open#exceptions
                    if(error.name == "InvalidStateError"){
                        reportError("Port is open in another tab, window, or program. Please disconnect this device from the other location: ", error);
                    }else if(error.name == "NetworkError"){
                        reportError("Failed to open port. It may be open in another tab, window, or program. Please disconnect this device from the other location:", error);
                    }else if(error.name == "TypeError"){
                        console.error("User did not select a port", error);
                    }else{
                        reportError("Unknown error while opening port: ", error);
                    }
                }
            }catch(error){
                // https://developer.mozilla.org/en-US/docs/Web/API/Serial/requestPort#exceptions
                if(error.name == "SecurityError"){
                    reportError("Security error while requesting ports...", error);
                }else if(error.name == "NotFoundError"){
                    console.error("User did not select a port", error);
                }else{
                    reportError("Unknown error while requesting port...", error);
                }
            }
        }
    }

    const handleSerialConnectButton = (event) => {
        if(isSerialConnected == false){
            connectSerial();
        }else{
            serial.current.disconnect();
        }
    }

    function onSimulatorData(value){
        // MicroPython webassembly is buffered by line
        xtermRefSimulator.current.write(value + "\r\n");
    }


    const chooseFilesPlatform = () => {
        choosePLatformModalRef.current?.showModal();
    }

    const openComputerFiles = () => {
        files = new ComputerFiles(setTree);
        setFiles(files);

        files.openFiles().then(() => {
            choosePLatformModalRef.current?.close();

            // Set this so that the files panel header renders with the correct platform
            setChoseComputer(true);

            // Get rid of any editor tabs that existed before
            setEditorTabsData([]);
            editorValues.current = {};

            // Get rid of any path that was set to run
            setPathCheckedToRun("");
        });
    }

    const openDeviceFiles = () => {
        connectSerial().then(() => {
            files = new DeviceFiles(serial.current, setTree);
            setFiles(files);

            files.openFiles().then(() => {
                choosePLatformModalRef.current?.close();

                // Set this so that the files panel header renders with the correct platform
                setChoseComputer(false);

                // Get rid of any editor tabs that existed before
                setEditorTabsData([]);
                editorValues.current = {};

                // Get rid of any path that was set to run
                setPathCheckedToRun("");
            })
        });
    }

    const getFilesPanelTitle = () => {
        const getTitle = () => {
            if(choseComputer == undefined){
                return "Files";
            }else if(choseComputer){
                return "Files: Computer";
            }else{
                return "Files: Device";
            }
        }

        return(
            <div className="w-full h-full flex">
                <div className="flex-1">
                    {getTitle()}
                </div>
                <div className="w-14 flex justify-center items-center">
                    <p>RUN</p>
                </div>
            </div>
        );
    }


    const switchToCodePanel = () => {
        setCurrentMainPanel("Code");
    }

    const switchToSimulatorPanel = () => {
        setCurrentMainPanel("Simulator");
    }

    const switchToImagePanel = () => {
        setCurrentMainPanel("Image");
    }


    const runOnDevice = () => {
        console.log("Run on device", pathCheckedToRun, allCheckedPaths.current);

        // Show error if nothing checked to run
        if(allCheckedPaths.current.length == 0){
            window.dispatchEvent(new CustomEvent("show_error", {detail: {customMessage: "Nothing checked to run"}}));
        }else{
            setActiveTerminalTabKey("Device");
        }
    }


    const runInSimulator = async () => {
        console.log("Run in simulator", pathCheckedToRun, allCheckedPaths.current);

        // Show error if nothing checked to run
        if(allCheckedPaths.current.length == 0){
            window.dispatchEvent(new CustomEvent("show_error", {detail: {customMessage: "Nothing checked to run"}}));
        }else{
            // Switch UI
            switchToSimulatorPanel();
            setActiveTerminalTabKey("Simulator");

            // If a Python file is checked to run, run that directly, otherwise,
            // a folder is checked and we need to run the file that is named
            // `main.py` or the same as the folder, or open manifest.ini and
            // see if the file to run is in there
            if(pathCheckedToRun.indexOf(".py") != -1){  // File
                simulatorRef.current.runSimulator([{path:pathCheckedToRun, data:await files.openFile(pathCheckedToRun)}], pathCheckedToRun);
            }else{                                      // Folder
                // Need to find this
                let full_path_to_run_file = "";

                // Need to fill this with {path:full_file_path, data:Uint8Array}
                let file_list = [];

                // Check to see if there's a file directly in the selected
                // folder called `main.py`, folder name + ".py" or if there
                // is a `manifest.ini` with a main file indicated
                for(let icx=0; icx<allCheckedPaths.current.length; icx++){
                    // Do not care about doing anything directly with folders
                    if(allCheckedPaths.current[icx].isFolder){
                        continue;
                    }

                    let file_path = allCheckedPaths.current[icx].path;
                    let last_index_of_slash = file_path.lastIndexOf("/");
                    let second_to_last_index_of_slash = file_path.lastIndexOf("/", last_index_of_slash-1);
                    let path = file_path.substring(0, last_index_of_slash);
                    let folder_name = file_path.substring(second_to_last_index_of_slash+1, last_index_of_slash);

                    // Only care about checking files that have the same path
                    // as the folder its in and not in any sub folders
                    if(path != pathCheckedToRun){
                        continue;
                    }

                    // If this path is in the selected folder (above) and it is `main.py`, use this and stop looking
                    if(file_path.indexOf("main.py") != -1){
                        full_path_to_run_file = file_path;
                        break;
                    }

                    // If this path is in the selected folder (above) and it is a file that's the folder name + ".py",
                    // use this and stop looking
                    if(file_path.indexOf(folder_name + ".py") != -1){
                        full_path_to_run_file = file_path;
                        break;
                    }

                    // If this path is in the selected folder (above) and it is a manifest file, open it and check for
                    // main file and build full path to it
                    if(file_path.indexOf("manifest.ini") != -1){
                        let fileData = await files.openFile(file_path);
                        fileData = new TextDecoder().decode(fileData);
                        fileData = fileData.split(/\r\n|\r|\n/);         // https://stackoverflow.com/a/52947649

                        fileData.forEach(line => {
                            if(line.indexOf("main") != -1){
                                let noSpacesLine = line.replace(/\s+/g, ''); // https://stackoverflow.com/a/5963202
                                let mainFileName = noSpacesLine.substring(noSpacesLine.indexOf("=")+1);
                                full_path_to_run_file = path + "/" + mainFileName;
                            }
                        });
                    }
                }

                // Error if a file to run was not found
                if(full_path_to_run_file == ""){
                    window.dispatchEvent(new CustomEvent("show_error", {detail: {customMessage: "Did not find a file to run!", errorStr: "Looked for `main.py`, Python file with same name as parent folder, and for a main file in a `manifest.ini` file"}}));
                    return;
                }

                // Open all the files to be copied to the simulator
                for(let icx=0; icx<allCheckedPaths.current.length; icx++){
                    if(allCheckedPaths.current[icx].isFolder == false){
                        let full_file_path = allCheckedPaths.current[icx].path;
                        let data = await files.openFile(full_file_path);
                        file_list.push({path:full_file_path, data:data});
                    }
                }

                // Run the file
                simulatorRef.current.runSimulator(file_list, full_path_to_run_file);
            }
        }
    }


    const handleShowErrorMsg = useCallback(() => {
        errorModalRef.current?.showModal();
        console.log(errorMsg);
    }, [errorModalRef]);

    useEffect(() => {
        window.addEventListener("show_error", (event) => {
            setErrorMsg(event.detail.customMessage);
            setErrorMsgDetails(event.detail.errorStr);
            handleShowErrorMsg();
        });

        try{
            if(serial.current == undefined){
                serial.current = new WebSerialOverride(setIsSerialConnectedWrapper);
                serial.current.receiveCallback = onSerialData;
                serial.current.activityCallback = onSerialActivity;
                serial.current.disconnectCallback = onSerialDisconnect;
            }
        }catch(error){
            console.error(error);
        }
    }, []);

    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-300 flex flex-col">


            {/* ### Error modal ### */}
            <Modal ref={errorModalRef}>
                <Modal.Header className="font-bold text-error">ERROR:</Modal.Header>
                <Modal.Body className="text-error">
                    {errorMsg}

                    {errorMsgDetails != undefined ? (<details>
                                                        <summary>Error Details</summary>
                                                        {errorMsgDetails}
                                                    </details>) 
                                                  : <></>}
                    
                </Modal.Body>

                <Modal.Actions>
                    <form method="dialog">
                        <Button>Close</Button>
                    </form>
                </Modal.Actions>
            </Modal>


            {/* ### Choose platform modal ### */}
            <Modal ref={choosePLatformModalRef}>
                <Modal.Header className="font-bold">Choose platform to open folder from:</Modal.Header>
                <Modal.Body className="">
                    <div className="w-full h-full flex flex-row justify-evenly">
                        <Button size="lg" onClick={openComputerFiles}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pc-display-horizontal" viewBox="0 0 16 16">
                                <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v7A1.5 1.5 0 0 0 1.5 10H6v1H1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5v-1h4.5A1.5 1.5 0 0 0 16 8.5v-7A1.5 1.5 0 0 0 14.5 0zm0 1h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5M12 12.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0m2 0a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0M1.5 12h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M1 14.25a.25.25 0 0 1 .25-.25h5.5a.25.25 0 1 1 0 .5h-5.5a.25.25 0 0 1-.25-.25"/>
                            </svg>
                            <p>Computer</p>
                        </Button>

                        <Button size="lg" onClick={openDeviceFiles}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cpu-fill" viewBox="0 0 16 16">
                                <path d="M6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
                                <path d="M5.5.5a.5.5 0 0 0-1 0V2A2.5 2.5 0 0 0 2 4.5H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2A2.5 2.5 0 0 0 4.5 14v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14a2.5 2.5 0 0 0 2.5-2.5h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14A2.5 2.5 0 0 0 11.5 2V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1zm1 4.5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3A1.5 1.5 0 0 1 6.5 5"/>
                            </svg>
                            <p>Device</p>
                        </Button>
                    </div>
                </Modal.Body>

                <Modal.Actions>
                    <form method="dialog">
                        <Button>Close</Button>
                    </form>
                </Modal.Actions>
            </Modal>


            {/* ### Header and open files button ### */}
            <div className="w-full h-16 bg-base-100 border-b-base-300 border-b-4 flex items-center">
                <div className="h-full flex-1 flex flex-row items-center">
                    <Button className="ml-2" size="sm" color="primary" onClick={chooseFilesPlatform} title="Open a folder from your computer or MicroPython device">
                        Open
                    </Button>

                    <div>
                        <Button onClick={handleSerialConnectButton} disabled={(choseComputer == undefined) ? true : false} className="ml-2" size='sm' color="primary" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px"}}>
                            {isSerialConnected == false ? <p>Connect</p> : <p>Disconnect</p>}
                        </Button>
                        <Button onClick={runOnDevice} disabled={(choseComputer == undefined || isSerialConnected == false) ? true : false} size='sm' color="primary" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px", borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                            Run
                        </Button>
                        <Input className='w-24' disabled={(choseComputer == undefined || isSerialConnected == false) ? true : false} size="sm" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px", borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                        </Input>
                        <Button disabled={(choseComputer == undefined || isSerialConnected == false) ? true : false} size='sm' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                            ...
                        </Button>
                    </div>

                    <div>
                        <Button onClick={runInSimulator} disabled={choseComputer == undefined ? true : false} className="ml-2" size='sm' color="primary" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px"}}>
                            Simulate
                        </Button>
                        <Input className='w-24' disabled={choseComputer == undefined ? true : false} size="sm" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px", borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                        </Input>
                        <Button disabled={choseComputer == undefined ? true : false} size='sm' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                            ...
                        </Button>
                    </div>
                </div>

                <div className="h-full flex-1 flex flex-row justify-center items-center">

                    <Button variant={currentMainPanel == "Code" ? "outline" : ""} onClick={switchToCodePanel} size='md' color="secondary" shape="square">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-code-slash" viewBox="0 0 16 16">
                            <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0"/>
                        </svg>
                    </Button>
                    <Button variant={currentMainPanel == "Simulator" ? "outline" : ""} onClick={switchToSimulatorPanel} size='md' color="secondary" shape="square" className="mx-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pc-display-horizontal" viewBox="0 0 16 16">
                            <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v7A1.5 1.5 0 0 0 1.5 10H6v1H1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5v-1h4.5A1.5 1.5 0 0 0 16 8.5v-7A1.5 1.5 0 0 0 14.5 0zm0 1h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5M12 12.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0m2 0a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0M1.5 12h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M1 14.25a.25.25 0 0 1 .25-.25h5.5a.25.25 0 1 1 0 .5h-5.5a.25.25 0 0 1-.25-.25"/>
                        </svg>
                    </Button>
                    <Button variant={currentMainPanel == "Image" ? "outline" : ""} onClick={switchToImagePanel} size='md' color="secondary" shape="square">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-image" viewBox="0 0 16 16">
                            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
                        </svg>
                    </Button>
                </div>

                <div className="h-full flex-1 flex flex-row items-center">
                    
                </div>
            </div>


            {/* ### Main panel group ### */}
            <PanelGroup direction="horizontal">
                
                {/* ### Left panel group ### */}
                <Panel className="bg-base-100" defaultSize={17} minSize={2} maxSize={98}>
                    <PanelGroup direction="vertical">

                        {/* ### File panel ### */}
                        {/* <Panel className="bg-base-100 w-full h-full" defaultSize={71.8} minSize={2} maxSize={98}> */}
                        <Panel className="bg-base-100 w-full h-full" minSize={2} maxSize={98}>
                            <div className="pl-1 w-full h-7 bg-base-200 flex items-center font-bold text-nowrap select-none">
                                {getFilesPanelTitle()}
                            </div>
                            
                            <FilesPanel tree={tree} addCodeEditor={addCodeEditor} pathCheckedToRun={pathCheckedToRun} setPathCheckedToRun={setPathCheckedToRun} allCheckedPaths={allCheckedPaths.current}/>
                        </Panel>
                    </PanelGroup>

                </Panel>

                <PanelResizeHandle className="w-1 bg-base-300"/>

                {/* Right panel group */}
                <Panel>
                    <PanelGroup direction="vertical">
                        <Panel className="bg-base-100" defaultSize={71.8} minSize={2} maxSize={98}>
                            <div className={"w-full h-full relative"}>

                                {/* CODE PANEL */}
                                <div className={"left-0 right-0 top-0 bottom-0 absolute " + (currentMainPanel == "Code" ? "z-10" : "z-0 invisible")}>
                                    <div className="left-0 right-0 top-0 bottom-0 z-20 absolute opacity-5" style={{backgroundImage:"url(\"logo.svg\")", backgroundRepeat:"no-repeat", backgroundPosition:"center", backgroundSize:"22%", backgroundBlendMode:"multiply"}}>
                                    </div>
                                    <div className="left-0 right-0 top-0 bottom-0 z-30 absolute">
                                        <TabPanel tabsData={editorTabsData} setTabsData={setEditorTabsData} draggable={false} closeable={true} activeTabKey={activeEditorTabKey} setActiveTabKey={setActiveEditorTabKey}/>
                                    </div>
                                </div>

                                {/* SIMULATOR PANEL */}
                                <div className={"left-0 right-0 top-0 bottom-0 absolute " + (currentMainPanel == "Simulator" ? "z-10" : "z-0 invisible")}>
                                    <div className="left-0 right-0 top-0 bottom-0 z-20 absolute">
                                        <SimulatorPanel ref={simulatorRef} onData={onSimulatorData}/>
                                    </div>
                                </div>

                                {/* IMAGE PANEL */}
                                <div className={"left-0 right-0 top-0 bottom-0 absolute " + (currentMainPanel == "Image" ? "z-10" : "z-0 invisible")}>
                                    <div className="left-0 right-0 top-0 bottom-0 z-20 absolute bg-success">
                                    </div>
                                </div>

                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-base-300" />

                        <Panel className="bg-base-100" defaultSize={28.2} minSize={2} maxSize={98} onResize={() => document.dispatchEvent(new Event("terminal-panel-resized"))}>
                            {/* <PanelHeader title="Terminal" /> */}
                            {/* <TerminalPanel ref={xtermRef} serial={serial} /> */}
                            <TabPanel tabsData={terminalTabsData} setTabsData={setTerminalTabsData} draggable={false} closeable={false} activeTabKey={activeTerminalTabKey} setActiveTabKey={setActiveTerminalTabKey}/>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>

            <div className="w-full h-6 bg-base-100 border-t-base-300 border-t-4">
                <div className="h-full flex-1 flex flex-row-reverse items-center">
                    <p className="font-extralight text-sm mr-1">TinyCircuits MicroPython Editor: ALPHA V10.11.2024.0</p>
                </div>
            </div>

        </Theme>
    )
}


export default App
