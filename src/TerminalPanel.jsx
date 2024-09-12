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

    const process = () => {
        // https://github.com/xtermjs/xterm.js/issues/1283#issuecomment-938246315
        fitAddon._terminal.element.parentElement.style.boxSizing = "content-box"
        fitAddon._terminal.element.parentElement.style.display = "grid"
        fitAddon.fit();
    }

    // This is called once
    useEffect(() => {
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminal");
        xterm.current.writeln("##### TinyCircuits Programming Terminalaaaaaaaa");
        xterm.current.writeln("##### TinyCircuits Programming Terminalaaaaaaaabbbbbbbbbbbbb");
        xterm.current.writeln("##### TinyCircuits Programming Terminalaaaaaaaabbbbbbbbbbbbb");
        xterm.current.writeln("##### TinyCircuits Programming Terminalaaaaaaaabbbbbbbbbbbbb");
    }, []);

    return (
        <div className="w-full h-full bg-accent">
            <XTerm ref={xterm} addons={[fitAddon]} onData={process} onResize={process} onRender={process} onWriteParsed={process} className="w-full h-full bg-accent"/>
        </div>
    )
}


export default TerminalPanel;