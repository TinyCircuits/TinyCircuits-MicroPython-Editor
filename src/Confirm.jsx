import './App.css'

import './../tailwind_output.css'
import { Theme, Input, Button, Toggle, Link } from 'react-daisyui'

import React from 'react';
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';



function Confirm(props){

    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col">
            Confirm
        </Theme>
    )
}


export default Confirm

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Confirm/>);