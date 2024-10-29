import './App.css'

import './../tailwind_output.css'
import { Theme, Input, Button, Swap, Toggle, Link } from 'react-daisyui'
import EmailValidator from 'email-validator'
import PocketBase from 'pocketbase'
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client'




function Resend(props){
    let pb = useRef(new PocketBase('http://127.0.0.1:8090'));
    let emailFieldRef = useRef(undefined);

    const [msg, setMsg] = useState({success:true, text:""});

    const showSuccessMsg = (msg) => {
        setMsg({success:true, text:msg});
    }


    const showErrorMsg = (msg) => {
        setMsg({success:false, text:msg});
    }


    // Send verification email if the email is a typical format
    const sendVerificationEmail = async () => {
        let email = emailFieldRef.current.value;
        
        // Check that email is a typical format
        if(!EmailValidator.validate(email)){
            setMsg({success:false, text:"*Please enter a valid email address"});
            return;
        }

        // Send verification request and output message depending on what happens
        try{
            await pb.current.collection('users').requestVerification('test@example.com');
            showSuccessMsg("Email sent!");

            setTimeout(() => {
                setMsg({success:true, text:""});
            }, 2500);
        }catch(error){
            console.error(error);
            showErrorMsg("Verification email could not be sent for some reason...");
        }
    }

    // If the msg is not empty, render it
    const getMsg = () => {
        if(msg.text == ""){
            return;
        }

        return(
            <div className="flex flex-row items-center justify-center mt-2">
                <p className={(msg.success ? "text-success outline-success" : "text-error outline-error") + " p-2 outline outline-1 rounded-lg"}>{msg.text}</p>
            </div>
        );
    }

    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col items-center justify-center">
            <div className="flex flex-col">
                <p className="font-bold text-lg mb-2">Enter Email:</p>

                <div className="flex">
                    <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none">Email</p>
                    <Input ref={emailFieldRef} className='w-72' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                </div>

                <div className="w-full flex flex-row justify-end">
                    <Button onClick={() => {sendVerificationEmail()}} color="primary" className='w-48 mt-2'>Send Verification Email</Button>
                </div>

                {getMsg()}
            </div>
        </Theme>
    )
}


export default Resend

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Resend/>);