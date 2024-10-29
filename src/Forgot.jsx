import './App.css'

import './tailwind_output.css'
import { Theme, Input, Button, Swap, Toggle, Link } from 'react-daisyui'

import React from 'react';
import { createRoot } from 'react-dom/client';



function Forgot(props){


    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col">
            Forgot
        </Theme>
    )
}


export default Forgot

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Forgot/>);