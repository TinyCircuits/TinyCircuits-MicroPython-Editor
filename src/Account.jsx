import './App.css'

import './tailwind_output.css'
import { Theme, Input, Button, Toggle, Link } from 'react-daisyui'

import React from 'react';
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './Page';
import Footer from './Footer';


function Account(props){

    return (
        <Page>
            <PageHeaderContents>
                <div className='w-full h-full flex items-center'>
                    <p className='text-lg font-bold ml-4'>Account</p>
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


export default Account

// Start access to the DOM in here to reduce number of main files needed
const root = createRoot(document.getElementById('root'));
root.render(<Account/>);