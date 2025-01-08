import './App.css'
import './tailwind_output.css'
import { Input, Join, Theme, Button, Progress } from 'react-daisyui'
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CustomModal from './CustomModal';

import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './Page';
import Footer from './Footer';
import setupRoot from './root';
import Pyboard from "./pyboard.js"


// Class that hold information about each game on the Arcade
class Game{
    //            `name`: the name of the game
    //  `descriptionURL`: the game's description
    //           `media`: .png or .webm video to display
    //    `fileURLsList`: list of full URLs to all the files the game needs to run
    constructor(name, descriptionURL, mediaURL, fileURLsList){
        this.name = name;
        this.descriptionURL = descriptionURL;
        this.mediaURL = mediaURL;
        this.fileURLsList = fileURLsList;

        this.media = undefined;
        this.description = undefined;
    }
}


function GameTile(props){
    const {game, onClick, className} = props;

    const ref = useRef(null);
    const display = useRef(null);
    const [isInView, setIsInView] = useState(false);

    const setSrc = () => {
        if(game.media != undefined){
            if(display.current == null){
                return;
            }

            display.current.setAttribute("src", game.media);

            // Only play videos if it is a video
            if(display.current.tagName == "video"){
                display.current.load();
            }
        }
    }

    useEffect(() => {
        setSrc();

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);

                // Don't do anything if not visible
                if(!entry.isIntersecting){
                    return;
                }

                if(game.media == undefined){
                    fetch(game.mediaURL).then(async (result) => {
                        game.media = URL.createObjectURL(await result.blob())
                        setSrc();
                    });
                }

                if(game.description == undefined){
                    fetch(game.descriptionURL).then(async (result) => {
                        game.description = await (await result.blob()).text();
                    });
                }
            },
        );

        if(ref.current){
            observer.observe(ref.current);
        }

        return () => {
            if(ref.current){
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const getThumbnail = () => {
        if(game.mediaURL.indexOf(".webm") != -1){
            return(
                <div className="flex h-full">
                    <video ref={display} autoPlay muted loop className="object-contain w-full h-auto">
                        <source src="" type="video/webm"></source>
                    </video>
                </div>
            );
        }else{
            return(
                <img ref={display} src="" className="object-cover w-full h-auto">
                </img>
            );
        }
    }

    return(
        <div ref={ref} onClick={onClick} className={'flex flex-col w-[170px] h-[190px] bg-base-300 rounded rounded-lg m-auto outline outline-1 outline-base-100 hover:outline-success ' + className}>
            <div className="flex items-center w-full h-[20px] bg-base-300">
                <p className="font-bold">{game.name}</p>
            </div>
            <div className="relative flex items-center justify-center w-full h-[170px]">
                {getThumbnail()}
            </div>
        </div>
    );
}


function Arcade(props){
    
    const [searchTerm, setSearchTerm] = useState(undefined);
    const [clickedGame, setClickedGame] = useState(undefined);
    const [progress, setProgress] = useState(0.0);
    const [downloadingGame, setDownloadingGame] = useState(undefined);
    let games = useRef([]);
    let overwriteModelRef = useRef(undefined);
    let lastChosenDirHandle = useRef(undefined);

    const setClickedGameWrapper = (game) => {
        if(clickedGame != undefined && clickedGame.name == game.name){
            setClickedGame(undefined);
        }else{
            setClickedGame(game);
        }
    }

    // Whenever the user updates the search term
    // store the updated string using state which
    // rerenders the page and game list
    const onSerachType = (event) => {
        setSearchTerm(event.target.value);

        // Reset clicked game on typing since clicked
        // game may become not visible anymore
        setClickedGame(undefined);

        // Put whatever is type into the URL query string
        // so that users can link to searches
        const url = new URL(window.location.href);

        if(event.target.value != ""){
            url.searchParams.set('search', event.target.value);
        }else{
            url.searchParams.delete("search");
        }
        
        window.history.pushState(null, '', url.toString());
    }


    const ifGameClickedStyle = (game) => {
        if(clickedGame == undefined){
            return "";
        }

        if(clickedGame.name == game.name){
            return "outline outline-2 outline-success";
        }
    }


    // Renders the game list with a search term. The search term makes
    // it so that games containing exactly `searchTerm` in their titles
    // show up
    const renderGameList = () => {
        return (
            <div className='w-full h-full overflow-auto justify-center items-center' style={{display:"grid",
                                                                                             gridTemplateColumns: "repeat(auto-fill, 200px)",
                                                                                             gridTemplateRows: "repeat(auto-fill, 200px)",
                                                                                             gap:"40px 40px",
                                                                                             scrollbarGutter: "stable both-edges"}}>
                {
                    games.current.map((game, gameIndex) => {
                        // Search for games by what's in the URL query string
                        const urlParams = new URLSearchParams(window.location.search);
                        const urlSearchTerm = urlParams.get('search');

                        // Only return game tiles when search term is empty
                        // or when the term matches something in the game title
                        if(urlSearchTerm == undefined || urlSearchTerm == "" || game.name.toLowerCase().indexOf(urlSearchTerm.toLowerCase()) != -1){
                            return(
                                <GameTile key={gameIndex} game={game} onClick={() => {setClickedGameWrapper(game)}} className={ifGameClickedStyle(game)}/>
                            )
                        }
                    })
                }
            </div>
        );
    }


    // Returns the search term already in the URL
    const getDefaultSearch = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlSearchTerm = urlParams.get('search');
        return urlSearchTerm;
    }


    // Fetch game URL list once per page load and parse into `Game`s
    useEffect(() => {
        window.addEventListener("set_progress", (event) => {
            setProgress(event.detail.progress);
        });

        window.addEventListener("end_progress", (event) => {
            setProgress(1.0);

            setTimeout(() => {
                setProgress(0.0)
            }, 250);
        });

        // Don't do anything if already have games
        if(games.length > 0){
            return;
        }

        fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/refs/heads/master/url_list.txt").then(async (result) => {
            let text = await result.text();
            text = text.split(/\r\n\s*\r\n|\r\s*\r|\n\s*\n/) // https://stackoverflow.com/a/52947649 + split only on empty line (newline + 0 whitesapce + newline)

            text.forEach((gameTextBlob) => {
                let gameLines = gameTextBlob.split(/\r\n|\r|\n/); // Split into lines

                // #1: Do not process anything that contains no data (needs to have
                //     more than one line for `NAME=` and `main.py` or `game.py`)
                if(gameLines.length <= 1){
                    return;
                }

                // #2: First line should contain `NAME=` and then the game name.
                //     Do not process and store anything that does not follow that
                //     rule. Get the name otherwise
                if(gameLines[0].indexOf("NAME=") == -1){
                    console.warn("WARNING: Did not process game because it did not contain `NAME=` line:", gameLines);
                    return;
                }

                let gameName = gameLines[0].substring(5);
                
                // #3: Find the `arcade_description.txt` file (named exactly that). Do not
                //     store or process any games that are missing it. Get the description
                //     otherwise
                let gameDescriptionURL = undefined;
                gameLines.forEach(line => {
                    if(line.indexOf("arcade_description.txt") != -1){
                        gameDescriptionURL = line;
                    }
                });

                if(gameDescriptionURL == undefined){
                    console.warn("WARNING: Game does not have a valid description, not processing it:", gameName, gameLines);
                    return;
                }

                // #4: Find any `.png` or `.webm` file for use for the game `icon`. Do not
                //     store or process any games without it. If both are found, use the
                //     `.webm` over the `.png`.
                let gamePNGURL = undefined;
                let gameWEBMURL = undefined;
                let gameMediaURL = undefined;
                gameLines.forEach(line => {
                    if(line.indexOf(".png") != -1){
                        gamePNGURL = line;
                    }

                    if(line.indexOf(".webm") != -1){
                        gameWEBMURL = line;
                    }
                });

                if(gamePNGURL == undefined && gameWEBMURL == undefined){
                    console.warn("WARNING: Game does not have a `.png` or `.webm`, not processing it:", gameName, gameLines);
                    return;
                }

                if(gamePNGURL != undefined){
                    gameMediaURL = gamePNGURL;
                }

                if(gameWEBMURL != undefined){
                    gameMediaURL = gameWEBMURL;
                }

                // #5: Now that the `NAME=`, `arcade_description.txt`, `.png`, and `.webm` lines are
                //     all parsed/found. Filter the game URL text lines down to just the files needed
                //     to run the game
                let gameFileURLSList = gameLines.filter((line) => {
                    if(line.indexOf("NAME=")                  != -1 ||
                       line.indexOf("arcade_description.txt") != -1 ||
                       line.indexOf(".png")                   != -1 ||
                       line.indexOf("webm")                   != -1){
                        return false;
                    }else{
                        return true;
                    }
                });

                // #6: Store the game info/URLs in a persistent location so we're
                //     not fetching stuff from GitHub all the time
                games.current.push(new Game(gameName, gameDescriptionURL, gameMediaURL, gameFileURLSList));
            });

            // Update search term to update and render list at page load
            setSearchTerm(getDefaultSearch());
        })
    }, [])

    const getClickedDescription = () => {
        if(clickedGame == undefined){
            return <></>;
        }else{
            return (
                <pre className='text-wrap' style={{whiteSpace:"pre-line"}}>{clickedGame.description}</pre>
            );
        }
    }


    const thumbyDownloadClickHandler = async () => {
        console.log("Started");

        const pyboard = new Pyboard();

        try {
            setDownloadingGame(true);

            // Connect to the device
            await pyboard.connect();
            console.log("### a0");

            // Enter raw REPL mode
            await pyboard.enterRawRepl();
            console.log("### 1a");

            // List the contents of the root directory
            const directoryContents = await pyboard.fsListdir('/');
            console.log('Directory contents:', directoryContents);
            console.log("### a2");

            for(let i=0; i<clickedGame.fileURLsList.length; i++){
                const fileURL = clickedGame.fileURLsList[i];
                const gameFile = await fetch(fileURL);
                let gameFilePath = "Games/" + fileURL.replace("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/", "");
                await pyboard.fsPut(new Uint8Array(await gameFile.arrayBuffer()), gameFilePath);
                window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: i / clickedGame.fileURLsList.length}}));
            }

            window.dispatchEvent(new CustomEvent("end_progress"));

            // Exit raw REPL mode
            await pyboard.exitRawRepl();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // Close the connection
            setDownloadingGame(false);
            await pyboard.close();
        }
    }


    const computerDownloadClicked = async () => {
        overwriteModelRef.current.close();

        let directoryHandle = lastChosenDirHandle.current;

        setDownloadingGame(true);

        for(let i=0; i<clickedGame.fileURLsList.length; i++){
            const fileURL = clickedGame.fileURLsList[i];

            const gameFile = await fetch(fileURL);
            let gameFilePath = fileURL.replace("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/" + clickedGame.name + "/", "");
            let gameFilePathSegments = gameFilePath.split("/");

            // Recursively build bath and write file
            const buildPath = async (parentDirHanlde, pathSegments) => {
                const segment = pathSegments.shift();

                if(pathSegments.length == 0){
                    const fileHandle = await parentDirHanlde.getFileHandle(segment, {create:true});
                    const writeable = await fileHandle.createWritable();
                    await writeable.write(new Uint8Array(await gameFile.arrayBuffer()));
                    await writeable.close();
                }else{
                    const dirHandle = await parentDirHanlde.getDirectoryHandle(segment, {create:true});
                    await buildPath(dirHandle, pathSegments);
                }
                
            }

            await buildPath(directoryHandle, gameFilePathSegments);
            window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: i / clickedGame.fileURLsList.length}}));
        }

        setDownloadingGame(false);

        window.dispatchEvent(new CustomEvent("end_progress"));
    };


    const computerDownloadClickHandler = async () => {
        try{
            // Get the directory handle for what the user chose
            // and the handle for the folder where the files will
            // eb downloaded to
            const directoryHandle = await window.showDirectoryPicker();

            try{
                lastChosenDirHandle.current = await directoryHandle.getDirectoryHandle(clickedGame.name);
                overwriteModelRef.current.showModal();
            }catch(exception){
                lastChosenDirHandle.current = await directoryHandle.getDirectoryHandle(clickedGame.name, {create:true});
                computerDownloadClicked();
            }            
        }catch(error){
            // Handle errors, e.g. user cancellation
            console.error('Error selecting directory:', error);
        }
    }


    return (
        <Page className="bg-repeat">
            <PageModalContents>
                {/* ### Choose platform modal ### */}
                <CustomModal title="Game folder already exists, overwrite it?" outlineColor="base-content" ref={overwriteModelRef}>
                    <div className="w-full h-full flex flex-row justify-evenly">
                        <Button size="lg" variant='outline' onClick={computerDownloadClicked}>
                            <p>Overwrite</p>
                        </Button>
                        <Button size="lg" variant='outline' onClick={() => {overwriteModelRef.current.close()}}>
                            <p>Cancel</p>
                        </Button>
                    </div>
                </CustomModal>
            </PageModalContents>

            <PageHeaderContents>
                <div className='w-full h-full flex items-center'>
                    <div className="w-full h-full flex items-center">
                        <p className='text-lg font-bold ml-4'>Arcade</p>
                    </div>
                    <div className="w-full h-full flex items-center flex-row-reverse">
                        <Button size="sm" color='secondary' tag="a" target="" rel="noopener" href="/" className='mr-4'>
                            Editor
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                            </svg>
                        </Button>
                    </div>
                </div>
            </PageHeaderContents>

            <PageBodyContents>
                <div className="relative w-full h-full flex justify-center items-center">
                    <div className="absolute w-full top-0 bottom-12 flex flex-row justify-center">

                        <div className="min-w-[175px] max-w-[40%] w-[40%] h-full bg-base-200 flex flex-col">
                            {/* HEADER */}
                            <div className="w-full h-10 bg-base-300 flex items-center">
                                <Join>
                                    <p className='mx-2 flex justify-center items-center'>Search:</p>
                                    <Input defaultValue={getDefaultSearch()} onChange={onSerachType} size='sm' className='w-[65%]'/>
                                </Join>
                            </div>

                            {/* BODY */}
                            <div className="w-full h-full flex flex-col overflow-hidden">
                                {renderGameList()}
                            </div>
                        </div>

                        <div className={(clickedGame != undefined) ? "min-w-[425px] w-[425px]" : "min-w-[0px] w-[0px]" + " h-full bg-base-300 flex flex-col overflow-hidden"}>
                            {/* BODY */}
                            
                            <div className="flex flex-col w-full h-full bg-base-300">
                                <div className="flex items-center justify-center w-full h-10">
                                    <p className="font-bold">{clickedGame == undefined ? "" : clickedGame.name}</p>
                                </div>

                                {/* TEXT */}
                                <div className="w-full h-full overflow-auto">
                                    {getClickedDescription()}
                                </div>

                                {/* BUTTONS */}
                                <div className="w-full h-14 border-0 border-t-4 border-base-200 flex items-center justify-evenly">
                                    <Button color='primary' size='sm' onClick={thumbyDownloadClickHandler} disabled={downloadingGame}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Thumby Download
                                    </Button>
                                    <Button color='primary' size='sm' onClick={computerDownloadClickHandler} disabled={downloadingGame}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Computer Download
                                    </Button>
                                </div>
                            </div>                            
                        </div>
                    </div>
                </div>
            </PageBodyContents>

            <PageFooterContents>
                <div className="w-full h-7 bg-base-100 border-t-base-300 border-t-4 flex flex-row">
                    <div className="h-full flex-1 flex items-center justify-center">
                        <p className="text-sm ml-2 font-extralight">{""}</p>
                        <Progress className='mx-1' color="primary" value={progress}></Progress>
                     </div>

                    <Footer />
                </div>
            </PageFooterContents>
        </Page>
    )
}


export default Arcade

setupRoot(<Arcade/>);