import './App.css'
import './tailwind_output.css'
import { Theme } from 'react-daisyui'
import React from 'react';
import { createRoot } from 'react-dom/client';


function Arcade(props){


    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col">
            Arcade
        </Theme>
    )
}


export default Arcade

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Arcade/>);