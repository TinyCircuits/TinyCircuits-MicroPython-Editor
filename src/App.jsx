import { useState, useRef, Children, useCallback, useEffect} from 'react'
import './App.css'

import './tailwind_output.css'
import { Theme, Button, Modal, Form, Checkbox, Progress, Input, Join, Accordion} from 'react-daisyui'
import PanelHeader from './PanelHeader.jsx'
import FilesPanel from './FilesPanel.jsx'
import TabPanel from './TabPanel.jsx'
import TerminalPanel from './TerminalPanel.jsx'
import { XTerm } from "@pablo-lion/xterm-react";

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

import ComputerFiles from './computer_files.js'
import DeviceFiles from './device_files.js'
// import Serial from './serial.js'



import WebSerialOverride from './WebSerialOverride.js'
// EventTarget.prototype.addEventListener = defaultAddEventListener;


import{
    getPanelElement,
    getPanelGroupElement,
    getResizeHandleElement,
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from "react-resizable-panels";





function App(props){

    let files = undefined;
    
    const [tabsData, setTabsData] = useState([
        { id: 0, children: {title:'main.py', component:<CodeMirror className='h-full w-full' height='100%' theme="dark" extensions={[python({ })]} />} },
        { id: 1, children: {title:'test.py', component:<CodeMirror className='h-full w-full' height='100%' theme="dark" extensions={[python({ })]} />} }
    ]);

    const [errorMsg, setErrorMsg] = useState("No error, you shouldn't see this...");
    const [errorMsgDetails, setErrorMsgDetails] = useState("No error details, you shouldn't see this...");

    const errorModalRef = useRef(null);
    const choosePLatformModalRef = useRef(null);
    const xtermRefDevice = useRef(null);
    const xtermRefSimulator = useRef(null);

    function onSerialData(value){
        xtermRefDevice.current.write(value);
    }

    function onSerialActivity(){
        
    }

    function onSerialDisconnect(){
        console.log("Serial disconnect")
        // serial.disconnect();
    }

    let serial  = undefined;

    try{
        serial = new WebSerialOverride();
        serial.receiveCallback = onSerialData;
        serial.activityCallback = onSerialActivity;
        serial.disconnectCallback = onSerialDisconnect;
    }catch(error){
        console.error(error);
    }

    const [terminalTabsData, setTerminalTabsData] = useState([
        { id: 0, children: {title:'Device Terminal', component:<TerminalPanel ref={xtermRefDevice} serial={serial} startMessage="Device Terminal"/>} },
        { id: 1, children: {title:'Simulator Terminal', component:<TerminalPanel ref={xtermRefSimulator} serial={serial} startMessage="Simulator Terminal"/>}},
    ]);

    const connectSerial = async () => {
        if(serial == undefined){
            reportError("Serial not defined. You are likely not using a Chromium based browser. Please use a browser like Google Chrome or Microsoft Edge.");
        }else{
            try{
                await serial.requestAccess(0x2E8A, 0x0005);
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

            try{
                await serial.connect();
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
        }
    }


    const chooseFilesPlatform = () => {
        choosePLatformModalRef.current?.showModal();
        // files_connection.open_files();
    }

    const openComputerFiles = () => {
        files = new ComputerFiles();
        files.open_files();
        choosePLatformModalRef.current?.close();
    }

    const openDeviceFiles = () => {
        files = new DeviceFiles(serial);
        files.open_files();
        choosePLatformModalRef.current?.close();
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
    }, []);

    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-300 flex flex-col">


            {/* ### Error modal ### */}
            <Modal ref={errorModalRef}>
                <Modal.Header className="font-bold text-error">ERROR:</Modal.Header>
                <Modal.Body className="text-error">
                    {errorMsg}

                    <details>
                        <summary>Error Details</summary>
                        {errorMsgDetails}
                    </details>
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
            <div className="w-full h-14 bg-base-100 border-b-base-300 border-b-4 flex items-center">
                <div className="h-full flex-1 flex flex-row items-center">
                    <Button className="btn-sm ml-2" color="primary" onClick={chooseFilesPlatform} title="Open a folder from your computer or MicroPython device">
                        Open Location
                    </Button>
                </div>
            </div>


            {/* ### Main panel group ### */}
            <PanelGroup direction="horizontal">
                
                {/* ### Left panel group ### */}
                <Panel className="bg-base-100" defaultSize={17} minSize={2} maxSize={98}>
                    <PanelGroup direction="vertical">

                        {/* ### File panel ### */}
                        <Panel className="bg-base-100" defaultSize={71.8} minSize={2} maxSize={98}>
                            <PanelHeader title="Files"/>
                            
                            <FilesPanel />
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-base-300"/>

                        {/* ### Device and simulator configuration panels ### */}
                        <Panel className="bg-base-100 flex" defaultSize={28.2} minSize={2} maxSize={98}>
                            <Join className="w-full" vertical={true}>
                                <Accordion icon="arrow" defaultChecked>
                                    <Accordion.Title className="font-bold bg-base-200 flex flex-row items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cpu-fill" viewBox="0 0 16 16">
                                            <path d="M6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
                                            <path d="M5.5.5a.5.5 0 0 0-1 0V2A2.5 2.5 0 0 0 2 4.5H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2A2.5 2.5 0 0 0 4.5 14v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14a2.5 2.5 0 0 0 2.5-2.5h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14A2.5 2.5 0 0 0 11.5 2V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1zm1 4.5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3A1.5 1.5 0 0 1 6.5 5"/>
                                        </svg>
                                        <p className="ml-1">Device</p>
                                        <div className="w-3 h-3 bg-neutral-content ml-2 mt-1 rounded-full" title="This turns green when the device is connected">

                                        </div>
                                    </Accordion.Title>
                                    <Accordion.Content className="flex w-full h-full">
                                        <div className="w-full h-28 flex flex-col">
                                            <div className="w-full flex-1 flex">
                                                <Button className="flex-2 h-full" size="sm" disabled={false} style={{borderRadius: "0px"}} onClick={connectSerial} title="Upload and run the opened project files on the device. Only uploads files from opened project if files differ.">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-usb-symbol" viewBox="0 0 16 16">
                                                        <path d="m7.792.312-1.533 2.3A.25.25 0 0 0 6.467 3H7.5v7.319a2.5 2.5 0 0 0-.515-.298L5.909 9.56A1.5 1.5 0 0 1 5 8.18v-.266a1.5 1.5 0 1 0-1 0v.266a2.5 2.5 0 0 0 1.515 2.298l1.076.461a1.5 1.5 0 0 1 .888 1.129 2.001 2.001 0 1 0 1.021-.006v-.902a1.5 1.5 0 0 1 .756-1.303l1.484-.848A2.5 2.5 0 0 0 11.995 7h.755a.25.25 0 0 0 .25-.25v-2.5a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25v2.5c0 .138.112.25.25.25h.741a1.5 1.5 0 0 1-.747 1.142L8.76 8.99a3 3 0 0 0-.26.17V3h1.033a.25.25 0 0 0 .208-.389L8.208.312a.25.25 0 0 0-.416 0"/>
                                                    </svg>
                                                    Connect
                                                </Button>
                                                <Button className="flex-1 h-full flex-nowrap" size="sm" disabled={false} style={{borderRadius: "0px"}} onClick={connectSerial} title="If files are opened from a computer, this button will upload files from the source location to the run location">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
                                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
                                                    </svg>
                                                    Upload
                                                </Button>
                                                <Button className="flex-2 h-full" size="sm" disabled={false} style={{borderRadius: "0px"}} onClick={connectSerial} title="Upload and run the opened project files on the device. Only uploads files from opened project if files differ.">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                                                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                                                    </svg>
                                                    Run
                                                </Button>
                                            </div>
                                            <div className="w-full flex-1 flex">
                                                <div className="w-full max-w-28 h-full flex items-center justify-center bg-base-300 select-none">
                                                    <p className="text-sm text-nowrap">Source Location:</p>
                                                </div>
                                                <div className="w-full h-full flex items-center justify-center select-none">
                                                    <Input className="h-full w-full" size="sm" style={{borderRadius: "0px"}}></Input>
                                                </div>
                                                <div className="w-full max-w-10 h-full flex items-center justify-center bg-base-300 select-none">
                                                    
                                                    <Button className="flex-2 h-full" size="sm" disabled={false} style={{borderRadius: "0px"}}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="w-full flex-1 flex">
                                                <div className="w-full max-w-28 h-full flex items-center justify-center bg-base-300 select-none">
                                                    <p className="text-sm text-nowrap">Run Location:</p>
                                                </div>
                                                <div className="w-full h-full flex items-center justify-center select-none">
                                                    <Input className="h-full w-full" size="sm" style={{borderRadius: "0px"}}></Input>
                                                </div>
                                                <div className="w-full max-w-10 h-full flex items-center justify-center bg-base-300 select-none">
                                                    
                                                    <Button className="flex-2 h-full" size="sm" disabled={false} style={{borderRadius: "0px"}}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion.Content>
                                </Accordion>
                                <Accordion icon="arrow">
                                    <Accordion.Title className="font-bold bg-base-200 flex flex-row items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-window-desktop" viewBox="0 0 16 16">
                                            <path d="M3.5 11a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/>
                                            <path d="M2.375 1A2.366 2.366 0 0 0 0 3.357v9.286A2.366 2.366 0 0 0 2.375 15h11.25A2.366 2.366 0 0 0 16 12.643V3.357A2.366 2.366 0 0 0 13.625 1zM1 3.357C1 2.612 1.611 2 2.375 2h11.25C14.389 2 15 2.612 15 3.357V4H1zM1 5h14v7.643c0 .745-.611 1.357-1.375 1.357H2.375A1.366 1.366 0 0 1 1 12.643z"/>
                                        </svg>
                                        <p className="ml-1">Simulator</p>
                                        <div className="w-3 h-3 bg-neutral-content ml-2 mt-1 rounded-full" title="This turns green when the simulator is running">

                                        </div>
                                    </Accordion.Title>
                                    <Accordion.Content className="flex w-full h-full">
                                        <div className="w-full h-28 bg-accent flex flex-col">
                                            <div className="w-full flex-1 flex">
                                                <Button className="flex-1 w-full h-full" size="sm" disabled={false} style={{borderRadius: "0px"}} onClick={connectSerial} title="Upload and run the opened project files on the device. Only uploads files from opened project if files differ.">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                                                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                                                    </svg>
                                                    Upload + Simulate
                                                </Button>
                                            </div>
                                            <div className="w-full flex-1 flex">
                                                <div className="w-full max-w-28 h-full flex items-center justify-center bg-base-300 select-none">
                                                    <p className="text-sm text-nowrap">Source Location:</p>
                                                </div>
                                                <div className="w-full h-full flex items-center justify-center select-none">
                                                    <Input className="h-full w-full" size="sm" style={{borderRadius: "0px"}}></Input>
                                                </div>
                                                <div className="w-full max-w-10 h-full flex items-center justify-center bg-base-300 select-none">
                                                    
                                                    <Button className="flex-2 h-full" size="sm" disabled={false} style={{borderRadius: "0px"}}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="w-full flex-1 flex">
                                                <div className="w-full max-w-28 h-full flex items-center justify-center bg-base-300 select-none">
                                                    <p className="text-sm text-nowrap">Run Location:</p>
                                                </div>
                                                <div className="w-full h-full flex items-center justify-center select-none">
                                                    <Input className="h-full w-full" size="sm" style={{borderRadius: "0px"}}></Input>
                                                </div>
                                                <div className="w-full max-w-10 h-full flex items-center justify-center bg-base-300 select-none">
                                                    
                                                    <Button className="flex-2 h-full" size="sm" disabled={false} style={{borderRadius: "0px"}}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots" viewBox="0 0 16 16">
                                                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion.Content>
                                </Accordion>
                            </Join>
                        </Panel>
                    </PanelGroup>

                </Panel>

                <PanelResizeHandle className="w-1 bg-base-300"/>

                {/* Right panel group */}
                <Panel>
                    <PanelGroup direction="vertical">
                        <Panel className="bg-base-100" defaultSize={71.8} minSize={2} maxSize={98}>
                            {/* <PanelHeader title="Code"/> */}
                            <TabPanel tabs={tabsData} draggable={false} closeable={true}/>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-base-300" />

                        <Panel className="bg-base-100" defaultSize={28.2} minSize={2} maxSize={98} onResize={() => document.dispatchEvent(new Event("terminal-panel-resized"))}>
                            {/* <PanelHeader title="Terminal" /> */}
                            {/* <TerminalPanel ref={xtermRef} serial={serial} /> */}
                            <TabPanel tabs={terminalTabsData} draggable={false} closeable={false}/>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>

            <div className="w-full h-6 bg-base-100 border-t-base-300 border-t-4">
                <div className="h-full flex-1 flex flex-row-reverse items-center">
                    <p className="font-extralight text-sm mr-1">TinyCircuits MicroPython Editor: V09.23.2024.0</p>
                </div>
            </div>

        </Theme>
    )
}


export default App
