import { useState } from 'react'
import './tailwind_output.css'
import { Theme, Button } from 'react-daisyui'


function PanelHeader(props){
    const title = props.title;

    return(
        <div className="w-full h-6 bg-base-200 flex items-center text-nowrap">
            <p className='text'>{title}</p>
        </div>
    )
}


export default PanelHeader