import './App.css'

import './../tailwind_output.css'
import { Theme, Input, Button, Toggle, Link } from 'react-daisyui'

import React from 'react';
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';



function PasswordConfirm(props){

    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col">
            Password Confirm
        </Theme>
    )
}


export default PasswordConfirm

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<PasswordConfirm/>);