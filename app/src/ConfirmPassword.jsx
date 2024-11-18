import './App.css'

import './../tailwind_output.css'
import { Theme, Input, Button, Toggle, Link, Join, Swap } from 'react-daisyui'
import User from './user';
import React from 'react';
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './Page';
import Footer from './Footer';
import setupRoot from './root';


function ConfirmPassword(props){

    const user = useRef(new User());

    let newPassworddRef = useRef(undefined);
    let newPasswordConfirmRef = useRef(undefined);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

    const [passwordWasReset, setPasswordWasReset] = useState(false);

    const onPasswordShow = (event, show, setter) => {
        if(show){
            setter(false);
        }else{
            setter(true);
        }
    }

    const [msg, setMsg] = useState({success:true, text:""});

    const showSuccessMsg = (msg) => {
        setMsg({success:true, text:msg});
    }

    const showErrorMsg = (msg) => {
        setMsg({success:false, text:msg});
    }


    const confirmPasswordReset = async () => {
        // Get the reset token
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        // Get passwords
        let newPassword = newPassworddRef.current.value;
        let newPasswordConfirm = newPasswordConfirmRef.current.value;

        // Check that they meet requirements
        if(newPassword.length <= 0){
            showErrorMsg("*Please enter a password");
            return;
        }else if(newPassword.length < 8){
            showErrorMsg("*Password needs to be at least 8 characters long");
            return;
        }else if(newPasswordConfirm.length <= 0){
            showErrorMsg("*Please re-type your password in the 'Confirm Password' field");
            return;
        }

        // Try to confirm password reset
        try{
            await user.current.collection('users').confirmPasswordReset(
                token,
                newPassword,
                newPasswordConfirm,
            );
            showSuccessMsg("Success! Password changed!");
            setPasswordWasReset(true);
        }catch(error){
            console.error(error);
            showErrorMsg("Error: Could not reset password for some reason...");
        }
    }


    const renderForm = () => {
        if(!passwordWasReset){
            return(
                <>
                    <p className="font-bold text-lg mb-2">Enter New Password:</p>
                    <div className="flex flex-col">


                        <div className="flex mt-2 relative">
                            <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none text-nowrap">New Password</p>
                            <Input ref={newPassworddRef} className='w-72' type={showNewPassword ? "text" : "password"} style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                            <Swap onClick={(event) => onPasswordShow(event, showNewPassword, setShowNewPassword)} className="absolute right-0 translate-y-[-50%] top-[50%] mr-2" onElement={
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                                    <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                                </svg>
                            } offElement={
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                                </svg>
                            }>
                            </Swap>
                        </div>
                        

                        <div className="flex mt-2 relative">
                            <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none text-nowrap">New Password</p>
                            <Input ref={newPasswordConfirmRef} className='w-72' type={showNewPasswordConfirm ? "text" : "password"} style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                            <Swap onClick={(event) => onPasswordShow(event, showNewPasswordConfirm, setShowNewPasswordConfirm)} className="absolute right-0 translate-y-[-50%] top-[50%] mr-2" onElement={
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                                    <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                                </svg>
                            } offElement={
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                                </svg>
                            }>
                            </Swap>
                        </div>
                    </div>

                    <div className="w-full flex flex-row justify-end">
                        <Button onClick={() => {confirmPasswordReset()}} color="primary" className='w-50 mt-2'>Reset Password</Button>
                    </div>
                </>
            );
        }else{

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
                    <p className='text-lg font-bold ml-4'>Reset Password</p>
                </div>
            </PageHeaderContents>

            <PageBodyContents>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="flex flex-col">
                        {renderForm()}
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


export default ConfirmPassword

setupRoot(<ConfirmPassword/>);