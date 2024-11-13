import './App.css'

import './tailwind_output.css'
import { Theme, Input, Button, Swap, Toggle, Link } from 'react-daisyui'
import User from './user';
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import EmailValidator from 'email-validator'

import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './Page';
import Footer from './Footer';


function Forgot(props){
    let user = useRef(new User());
    let emailFieldRef = useRef(undefined);

    const [msg, setMsg] = useState({success:true, text:""});

    const showSuccessMsg = (msg) => {
        setMsg({success:true, text:msg});
    }


    const showErrorMsg = (msg) => {
        setMsg({success:false, text:msg});
    }


    // Send verification email if the email is a typical format
    const sendPasswordReset = async () => {
        let email = emailFieldRef.current.value;
        
        // Check that email is a typical format
        if(!EmailValidator.validate(email)){
            setMsg({success:false, text:"*Please enter a valid email address"});
            return;
        }

        // Send verification request and output message depending on what happens
        try{
            await user.current.collection('users').requestPasswordReset(email);
            showSuccessMsg("Email sent!");

            setTimeout(() => {
                setMsg({success:true, text:""});
            }, 2500);
        }catch(error){
            console.error(error);
            showErrorMsg("Password reset email could not be sent for some reason...");
        }
    }


    // If the msg is not empty, render it
    const renderMsg = () => {
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
        <Page>
            <PageHeaderContents>
                <div className='w-full h-full flex items-center'>
                    <p className='text-lg font-bold ml-4'>Request Password Reset</p>
                </div>
            </PageHeaderContents>

            <PageBodyContents>
                <div className='w-full h-full flex flex-col justify-center items-center'>
                    <div className="flex flex-col">
                        <p className="font-bold text-lg mb-2">Enter Email:</p>

                        <div className="flex">
                            <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none">Email</p>
                            <Input ref={emailFieldRef} className='w-72' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                        </div>

                        <div className="w-full flex flex-row justify-end">
                            <Button onClick={() => {sendPasswordReset()}} color="primary" className='w-50 mt-2'>Send Password Reset Email</Button>
                        </div>

                        {renderMsg()}
                    </div>
                </div>
            </PageBodyContents>

            <PageFooterContents>
                <Footer />
            </PageFooterContents>
        </Page>
    )
}


export default Forgot

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Forgot/>);