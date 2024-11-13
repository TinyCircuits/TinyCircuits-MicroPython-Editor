import './App.css'
import './../tailwind_output.css'
import { Theme } from 'react-daisyui'
import React from 'react';
import { createRoot } from 'react-dom/client';
import User from './user';
import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './Page';
import Footer from './Footer';
import { useRef, useEffect } from 'react';
import { setThrowback } from './throwback';


function Submit(props){
    // Custom Pocketbase user class
    const user = useRef(new User());

    // Check that the user is logged in and can make submissions,
    // otherwise, redirect to login page with string to throw user
    // back to here
    useEffect(() => {
        if(!user.current.loggedIn()){
            setThrowback("/login/");
        }
    }, [])

    return (
        <Page>
            <PageHeaderContents>
                <div className='w-full h-full flex items-center'>
                    <p className='text-lg font-bold ml-4'>Arcade Submission</p>
                </div>
            </PageHeaderContents>

            <PageBodyContents>
                
            </PageBodyContents>

            <PageFooterContents>
                <Footer />
            </PageFooterContents>
        </Page>
    )
}


export default Submit

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Submit/>);