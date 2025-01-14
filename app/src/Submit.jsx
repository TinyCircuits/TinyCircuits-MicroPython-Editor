import './App.css'
import './tailwind_output.css'
import { Theme } from 'react-daisyui'
import React, { useState } from 'react';
import User from './user';
import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './Page';
import Footer from './Footer';
import { useRef, useEffect } from 'react';
import { setThrowback } from './throwback';
import GameCard from './GameCard';
import setupRoot from './root';

import {Input, Join, Textarea, Button} from 'react-daisyui';


function Submission(props){

    const [droppedFiles, setDroppedFiles] = useState([]);

    const onFileDragOverHandler = (event) => {
        event.preventDefault();
    }

    const onFileDropHandler = (event) => {
        event.preventDefault();

        let newDroppedFiles = [...droppedFiles];
        for(let ifx=0; ifx<event.dataTransfer.files.length; ifx++){
            let file = event.dataTransfer.files[ifx];
            newDroppedFiles.push(file);
        }
        setDroppedFiles(newDroppedFiles);

        console.log(newDroppedFiles);
    }

    return(
        <div className='w-full h-full flex flex-col'>
            <div className='flex-1 flex flex-col items-center justify-center'>
                <p className='font-bold mb-2'>*Game Title</p>
                <Input size='sm' className='w-80'></Input>
            </div>

            <div className='flex-1 flex flex-col'>
                <p className='font-bold ml-2'>*Game Images and Videos</p>
                
                {/* Image/Video Track */}
                <div className='flex-1 bg-error my-2 hover:outline hover:outline-1' onDrop={onFileDropHandler} onDragOver={onFileDragOverHandler}>
                </div>
            </div>

            <div className='flex-1 flex flex-col'>
                <p className='font-bold ml-2'>*Game Description</p>
                <Textarea size='lg text-xs' className='flex-1 m-2'></Textarea>
            </div>
        </div>
    );
}


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
                <div className='flex-1 flex flex-col'>
                    <div className='flex-1 flex mb-4'>
                        <div className='flex-1 ml-6 mr-3 flex flex-col bg-base-200 rounded-3xl'>
                            <p className='font-bold text-lg ml-4 mt-2'>Submission</p>
                            <Submission />
                        </div>
                        <div className='flex-1 mr-6 ml-3 flex flex-col bg-base-200 rounded-3xl'>
                            <p className='font-bold text-lg ml-4 mt-2'>Arcade Preview</p>
                        </div>
                    </div>
                    
                    <div className='h-12 flex mb-4 items-center justify-center'>
                        <Button color='primary'>Submit</Button>
                    </div>
                </div>
                
            </PageBodyContents>

            <PageFooterContents>
                <Footer />
            </PageFooterContents>
        </Page>
    )
}


export default Submit

setupRoot(<Submit/>)