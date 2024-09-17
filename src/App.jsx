import { useState, useRef, Children, useCallback, useEffect} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import './tailwind_output.css'
import { Theme, Button, Modal} from 'react-daisyui'
import PageHeader from './PageHeader.jsx'
import PageFooter from './PageFooter.jsx'
import PanelHeader from './PanelHeader.jsx'
import FilesPanel from './FilesPanel.jsx'
import CodePanel from './CodePanel.jsx'
import TerminalPanel from './TerminalPanel.jsx'

import FilesConnection from './files_connection.js'
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


const files_connection = new FilesConnection();




function App(props){
    const [errorMsg, setErrorMsg] = useState("No error, you shouldn't see this...");
    const [errorMsgDetails, setErrorMsgDetails] = useState("No error details, you shouldn't see this...");

    const errorModalRef = useRef(null);
    const xtermRef = useRef(null);

    let serial = undefined;

    try{
        serial = new WebSerialOverride();
        serial.receiveCallback = onSerialData;
        serial.activityCallback = onSerialActivity;
        serial.disconnectCallback = onSerialDisconnect;
    }catch(error){
        console.error(error);
    }

    function onSerialData(value){
        xtermRef.current.write(value);
    }

    function onSerialActivity(){
        console.log("Hi");
    }

    function onSerialDisconnect(){
        console.log("Serial disconnect")
        // serial.disconnect();
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
        <div className="w-full h-full bg-base-300 flex flex-col">
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


            <PageHeader files_connection={files_connection} serial={serial}>

            </PageHeader>


            <PanelGroup direction="horizontal">
                <Panel className="bg-base-100" defaultSize={15} minSize={2} maxSize={98}>


                <PanelGroup direction="vertical">
                        <Panel className="bg-base-100" minSize={2} maxSize={98} defaultSize={50}>
                            <PanelHeader title="Computer Files"/>
                            <FilesPanel />
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-base-300" />

                        <Panel className="bg-base-100 flex w-full h-full justify-center" minSize={4} maxSize={4}>
                            <Button color="accent" size='sm' className="ml-2" title="ctrl-shift-u">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                                </svg>
                                Sync
                            </Button>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-base-300" />

                        <Panel className="bg-base-100 flex flex-col" minSize={2} maxSize={98} defaultSize={50}>
                            <PanelHeader title="Device Files"/>
                            <FilesPanel />
                        </Panel>
                    </PanelGroup>

                </Panel>

                <PanelResizeHandle className="w-1 bg-base-300"/>

                <Panel>
                    <PanelGroup direction="vertical">
                        <Panel className="bg-base-100" minSize={2} maxSize={98}>
                            {/* <PanelHeader title="Code"/> */}
                            <CodePanel />
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-base-300" />

                        <Panel className="bg-base-100 flex flex-col" defaultSize={26} minSize={2} maxSize={98} onResize={() => document.dispatchEvent(new Event("terminal-panel-resized"))}>
                            {/* <PanelHeader title="Terminal" /> */}
                            <TerminalPanel ref={xtermRef} serial={serial} />
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>

            <PageFooter>

            </PageFooter>

        </div>
    )
}


export default App
