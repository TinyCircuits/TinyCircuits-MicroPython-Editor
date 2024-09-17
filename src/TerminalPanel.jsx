import React, { useState, useRef, useEffect, forwardRef} from 'react'
import './tailwind_output.css'
import { Theme, Button, Tabs as DaisyTabs} from 'react-daisyui'
import { XTerm } from "@pablo-lion/xterm-react";
import { FitAddon } from "@xterm/addon-fit"



const TerminalPanel = forwardRef(function TerminalPanel(props, xtermRef){
    // Instantiate the addon
    const fitAddon = new FitAddon();
    const serial = props.serial;

    // https://github.com/PabloLION/xterm-react/blob/main/docs.md#calling-xterm-functions
    // const xterm = useRef(null);

    const handleFit = () => {
        // https://github.com/xtermjs/xterm.js/issues/1283#issuecomment-938246315
        if(fitAddon._terminal != undefined){
            fitAddon._terminal.element.parentElement.style.boxSizing = "content-box"
            fitAddon._terminal.element.parentElement.style.display = "grid"
            fitAddon.fit();
        }
    }

    // https://github.com/PabloLION/xterm-react/blob/main/docs.md#calling-xterm-functions:~:text=the%20cursor%20moves.-,onData,-%3F%3A%20IEventListener%3Cstring%3E
    const onData = (data) => {
        serial.write(data);
    }

    // This is called once
    useEffect(() => {
        document.addEventListener("terminal-panel-resized", handleFit);
        xtermRef.current.writeln("TinyCircuits MicroPython Editor Terminal");
        xtermRef.current.writeln("----------------------------------------");
    }, []);


    return (
        <div className="w-full h-full bg-accent">
            <XTerm ref={xtermRef} addons={[fitAddon]} onRender={handleFit} onData={onData} className="w-full h-full bg-accent"/>
        </div>
    )
});


export default TerminalPanel;