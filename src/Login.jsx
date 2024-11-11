import './App.css'

import './tailwind_output.css'
import { Theme, Input, Button, Swap, Toggle, Link } from 'react-daisyui'

import React from 'react';
import { useState, useRef } from 'react';
import User from './user';
import EmailValidator from 'email-validator'
import { createRoot } from 'react-dom/client';




function Login(props){

    // https://pocketbase.io/docs/authentication/#authenticate-as-app-user
    // https://github.com/pocketbase/js-sdk?tab=readme-ov-file#usage
    const user = useRef(new User());
    let pbUser = useRef(undefined);

    const [registerEnabled, setRegisterEnabled] = useState(false);
    const [errorMsg, setErrorMsg] = useState(undefined);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const [registered, setRegistered] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [sentVerification, setSentVerification] = useState(false);

    let emailFieldRef = useRef(undefined);
    let usernameFieldRef = useRef(undefined);
    let passwordFieldRef = useRef(undefined);
    let passwordConfirmFieldRef = useRef(undefined);

    
    const onPasswordShow = (event, show, setter) => {
        if(show){
            setter(false);
        }else{
            setter(true);
        }
    }

    const onRegisterChange = (event) => {
        if(registerEnabled){
            setRegisterEnabled(false);
        }else{
            setRegisterEnabled(true);
        }
    }

    const login = async (email, password) => {
        console.log("Login");

        try{
            pbUser.current = await user.current.collection('users').authWithPassword(email, password);
            setErrorMsg(undefined);
            setLoggedIn(true);
        }catch(error){
            if(error.name == "ClientResponseError 400"){
                setErrorMsg(error.message + " Are the email and password correct?");
            }else{
                setErrorMsg(error.message);
            }
            console.error(error);
        }
    }


    const register = async (email, username, password, passwordConfirm) => {
        console.log("Register");

        const data = {
            "username": username,
            "email":    email,
            "emailVisibility": false,
            "password": password,
            "passwordConfirm": passwordConfirm
        };

        if(password != passwordConfirm){
            setErrorMsg("*'Password' and 'Confirm Password' fields do not match");
            return;
        }

        try{
            const record = await user.current.collection('users').create(data);
            setErrorMsg(undefined);
            setRegistered(true);
        }catch(error){
            setErrorMsg(error.message);
            console.error(error);
        }

        try{
            await user.current.collection('users').requestVerification(email);
            setErrorMsg(undefined);
            setSentVerification(true);
        }catch(error){
            setErrorMsg(error.message);
            console.error(error);
        }
    }


    const onSubmit = async (event) => {
        const email           = emailFieldRef.current.value;
        const username        = (usernameFieldRef.current == undefined) ? undefined : usernameFieldRef.current.value;
        const password        = passwordFieldRef.current.value;
        const passwordConfirm = (passwordConfirmFieldRef.current == undefined) ? undefined : passwordConfirmFieldRef.current.value;

        if(email.length <= 0){
            setErrorMsg("*Please enter an email");
            return;
        }else if(EmailValidator.validate(email) == false){
            setErrorMsg("*Please enter a valid email address");
            return;
        }else if(registerEnabled && username.length <= 0){
            setErrorMsg("*Please enter a username");
            return;
        }else if(registerEnabled && username.length < 3){
            setErrorMsg("*Username needs to be at least 3 characters long");
            return;
        }else if(password.length <= 0){
            setErrorMsg("*Please enter a password");
            return;
        }else if(password.length < 8){
            setErrorMsg("*Password needs to be at least 8 characters long");
            return;
        }else if(registerEnabled && passwordConfirm.length <= 0){
            setErrorMsg("*Please re-type your password in the 'Confirm Password' field");
            return;
        }

        if(registerEnabled){
            register(email, username, password, passwordConfirm);
        }else{
            login(email, password);
        }
    }


    const renderForm = () => {

        if(loggedIn){
            setTimeout(() => {
                window.location.pathname = "/";
            }, 1500);

            return(
                <div className="w-full h-full flex flex-col items-center justify-center text-success text-lg">
                    <p>Logged in! Going back to main page...</p>
                </div>
            );
        }else if(registered && sentVerification){
            return(
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <p className='text-success text-lg'>Registered! Check your email to verify your account before logging in.</p>
                </div>
            );
        }else if(registered && sentVerification == false){
            return(
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <p className='text-success text-lg'>Registered!</p><p className='text-error text-lg'>Email verification could not be sent, would you like to retry?</p>
                    <Button color="primary" className='mt-4' onClick={() => {window.location.href = "resend/"}}>Resend</Button>
                </div>
            );
        }else{
            return(
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div>

                        {/* Form header */}
                        <div className="flex">
                            <div className="flex-1 flex h-12">
                                <p className="font-bold text-lg m-2 select-none">{registerEnabled ? "Register" : "Login"}</p>
                            </div>
                            <div className="flex-1 flex h-12 justify-end">
                                <div className="flex mt-2 w-40 flex justify-evenly">
                                    <p className="select-none font-bold">Register:</p>
                                    <Toggle value={registerEnabled} onChange={onRegisterChange} color="primary" />
                                </div>
                            </div>
                        </div>

                        {/* Username email input */}
                        <div className="flex">
                            <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none text-nowrap">Email</p>
                            <Input ref={emailFieldRef} className='w-72' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                        </div>

                        {registerEnabled ?
                            // Username input
                            <div className="flex mt-2">
                                <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none text-nowrap">Username</p>
                                <Input ref={usernameFieldRef} className='w-72' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                            </div> 
                                        :
                            ""}
                        
                        {/* Password input */}
                        <div className="flex mt-2 relative">
                            <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none text-nowrap">Password</p>
                            <Input ref={passwordFieldRef} className='w-72' type={showPassword ? "text" : "password"} style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                            <Swap onClick={(event) => onPasswordShow(event, showPassword, setShowPassword)} className="absolute right-0 translate-y-[-50%] top-[50%] mr-2" onElement={
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

                        {registerEnabled ?
                            // Confirm password input
                            <div className="flex mt-2 relative">
                                <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none text-nowrap">Confirm Password</p>
                                <Input ref={passwordConfirmFieldRef} className='w-72' type={showPasswordConfirm ? "text" : "password"} style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                                <Swap onClick={(event) => onPasswordShow(event, showPasswordConfirm, setShowPasswordConfirm)} className="absolute right-0 translate-y-[-50%] top-[50%] mr-2" onElement={
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
                                        :
                            ""}

                        {/* Form footer */}
                        <div className="flex mt-2">
                            <div className="flex-1 w-full h-12 items-center flex flex-row justify-evenly">
                                <Link target="_blank" href="/login/forgot/">Forgot password?</Link>
                                <Link target="_blank" href="/login/resend/">Resend Verification</Link>
                            </div>
                            <div className="flex h-12 justify-end">
                                <Button color='primary' onClick={onSubmit}>{registerEnabled ? "Create Account" : "Login"}</Button>
                            </div>
                        </div>

                        

                        {(errorMsg != undefined) ?
                            // Error
                            <div className="w-full h-10 outline outline-1 outline-error mt-2 rounded-lg flex items-center justify-center text-error">
                                {errorMsg}
                            </div> 
                                        :
                            ""}
                    </div>
                </div>
            );
        }
    }


    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col">
            {/* Page header */}
            <div className='w-full h-12 font-bold text-lg'>
                <p className='m-2'>TinyCircuits MicroPython Editor Login</p>
            </div>

            {renderForm()}

            {/* Privacy Policy */}
            <div className='w-full h-12 justify-end flex'>
                <Link className='m-2'>Privacy Policy</Link>
            </div>
        </Theme>
    )
}


export default Login

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Login/>);