import './App.css'

import './../tailwind_output.css'
import { Theme, Button } from 'react-daisyui'
import User from './user';
import React, { useState } from 'react';
import { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';



function ConfirmEmail(props){
    let user = useRef(new User());

    const [verifed, setVerifed] = useState(false);

    const renderConfirmedOrNot = () => {
        if(verifed){
            return(
                <>
                    <p className="text-success text-lg">Success! Email verifed!</p>
                    <Button color="primary" className='mt-4' tag="a" rel="noopener" href='http://localhost:5173/login/'>Login</Button>
                </>
            ); 
        }else{
            return(
                <p className="text-error text-lg">ERROR: Email could not be verifed for some reason</p>
            );
        }
    }

    useEffect(() => {
        console.log("Verifying...");

        // Get the email verifaction token
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        user.current.collection('users').confirmVerification(token).then(() => {
            setVerifed(true);
        }).catch((error) => {
            console.error(error);
            console.error(error.url);
            console.error(error.status);
            console.error(error.response);
            console.error(error.isAbort);
            setVerifed(false);
        });
    }, []);

    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col items-center justify-center">
            {renderConfirmedOrNot()}
        </Theme>
    )
}


export default ConfirmEmail

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<ConfirmEmail/>);