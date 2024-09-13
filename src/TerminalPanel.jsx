import { useState, useRef, useEffect} from 'react'
import './tailwind_output.css'
import { Theme, Button, Tabs as DaisyTabs} from 'react-daisyui'
import { XTerm } from "@pablo-lion/xterm-react";
import { FitAddon } from "@xterm/addon-fit"



function TerminalPanel(props){
    // Instantiate the addon
    const fitAddon = new FitAddon()

    // https://github.com/PabloLION/xterm-react/blob/main/docs.md#calling-xterm-functions
    const xterm = useRef(null);

    const handleFit = () => {
        // https://github.com/xtermjs/xterm.js/issues/1283#issuecomment-938246315
        if(fitAddon._terminal != undefined){
            fitAddon._terminal.element.parentElement.style.boxSizing = "content-box"
            fitAddon._terminal.element.parentElement.style.display = "grid"
            fitAddon.fit();
        }
    }

    // This is called once
    useEffect(() => {
        document.addEventListener("terminal-panel-resized", handleFit);
    }, []);

    return (
        <div className="w-full h-full bg-accent">
            <XTerm ref={xterm} addons={[fitAddon]} onRender={handleFit} className="w-full h-full bg-accent"/>
        </div>
    )
}


export default TerminalPanel;