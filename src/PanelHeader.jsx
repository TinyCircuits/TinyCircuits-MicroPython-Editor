import { useState } from 'react'
import './tailwind_output.css'
import { Theme, Button } from 'react-daisyui'


function PanelHeader(props){
    const title = props.title;

    return(
        <div className="pl-1 w-full h-7 bg-base-200 flex items-center font-bold text-nowrap select-none">
            <p className='text'>{title}</p>
        </div>
    )
}


export default PanelHeader