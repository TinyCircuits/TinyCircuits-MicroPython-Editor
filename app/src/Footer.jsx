import './App.css'
import './tailwind_output.css'

import { Link } from 'react-daisyui';

function Footer(props){

    const {className} = props;

    return(
        <div className="flex-1 flex flex-row-reverse items-center">
            <Link href="/privacy/" target="_blank" className='m-2 text-sm underline'>Privacy Policy</Link>
            <p className="font-extralight text-sm mr-1">TinyCircuits MicroPython Editor: ALPHA V11.13.2024.0</p>
        </div>
    )
}


export default Footer;