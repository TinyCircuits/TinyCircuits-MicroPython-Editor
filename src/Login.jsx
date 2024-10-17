import './App.css'

import './tailwind_output.css'
import { Theme, Input, Button, Toggle } from 'react-daisyui'

import React from 'react';
import { useState } from 'react';




function Login(props){

    const [registerEnabled, setRegisterEnabled] = useState(false);

    const onRegisterChange = (event) => {
        if(registerEnabled){
            setRegisterEnabled(false);
        }else{
            setRegisterEnabled(true);
        }
    }


    return (
        <Theme dataTheme="dim" className="w-full h-full bg-base-100 flex flex-col">
            {/* Page header */}
            <div className='w-full h-12 font-bold text-lg'>
                <p className='m-2'>TinyCircuits MicroPython Editor Login</p>
            </div>

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
                        <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none">Username/Email</p>
                        <Input className='w-72' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                    </div>
                    
                    {/* Password input */}
                    <div className="flex mt-2">
                        <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none">Password</p>
                        <Input className='w-72' type='password' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                    </div>

                    {registerEnabled ?
                        // Confirm password input
                        <div className="flex mt-2">
                            <p className="w-40 h-12 bg-base-300 flex items-center justify-center rounded-l-full p-4 select-none">Confirm Password</p>
                            <Input className='w-72' type='password' style={{borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}/>
                        </div> 
                                     :
                        ""}

                    {/* Form footer */}
                    <div className="flex mt-2">
                        <div className="flex-1 flex h-12 items-center justify-start">
                            <a>Forgot password?</a>
                        </div>
                        <div className="flex-1 flex h-12 justify-end">
                            <Button color='primary'>{registerEnabled ? "Create" : "Login"}</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Policy */}
            <div className='w-full h-12 justify-end flex'>
                <a className='m-2'>Privacy Policy</a>
            </div>
        </Theme>
    )
}


export default Login