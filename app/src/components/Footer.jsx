import { Link } from 'react-daisyui';

function Footer(props){

    const {className} = props;

    return(
        <div className="flex-1 flex flex-row-reverse items-center">
            <p className="font-extralight text-sm mr-1">TinyCircuits MicroPython Editor: ALPHA V02.10.2025.0</p>
        </div>
    )
}


export default Footer;