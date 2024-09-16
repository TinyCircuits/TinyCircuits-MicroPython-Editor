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
let serial  = undefined;

try{
    serial = new WebSerialOverride();
    serial.receiveCallback = test;
    serial.activityCallback = test2;
    serial.disconnectCallback = disconnect;
}catch(error){
    console.error(error);
}



function test(value){
    console.log(value);
}

function test2(){
    console.log("Hi");
}

function disconnect(){
    console.log("Dis")
}



// window.addEventListener("unhandledrejection", (ev) => {
//   // report("Error", new Error(ev.reason));
//   // ev.preventDefault();
// });



function App(props){

    const [errorMsg, setErrorMsg] = useState("No error, you shouldn't see this...");
    const [errorMsgDetails, setErrorMsgDetails] = useState("No error details, you shouldn't see this...");

    const ref = useRef(null);
    const handleShowErrorMsg = useCallback(() => {
        ref.current?.showModal();
        console.log(errorMsg);
    }, [ref]);

    useEffect(() => {
        window.addEventListener("show_error", (event) => {
            setErrorMsg(event.detail.customMessage);
            setErrorMsgDetails(event.detail.errorStr);
            handleShowErrorMsg();
        });
    }, []);

    return (
        <div className="w-full h-full bg-base-300 flex flex-col">
            <Modal ref={ref}>
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
                {/* <Panel className="bg-base-100" defaultSize={15} minSize={2} maxSize={98}>
          <PanelHeader title="Computer Files"/>
          <FilesPanel />
        </Panel>

        <PanelResizeHandle className="w-1 bg-base-300"/> */}

                <Panel>
                    <PanelGroup direction="vertical">
                        <Panel className="bg-base-100" minSize={2} maxSize={98}>
                            {/* <PanelHeader title="Code"/> */}
                            <CodePanel />
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-base-300" />

                        <Panel className="bg-base-100" defaultSize={26} minSize={2} maxSize={98} onResize={() => document.dispatchEvent(new Event("terminal-panel-resized"))}>
                            <PanelHeader title="Terminal" />
                            <TerminalPanel />
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
