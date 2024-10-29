import './App.css'

import './tailwind_output.css'
import { Theme, Input, Button, Toggle, Link } from 'react-daisyui'

import React from 'react';
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';



function Account(props){

    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col">
            Account
        </Theme>
    )
}


export default Account

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Account/>);