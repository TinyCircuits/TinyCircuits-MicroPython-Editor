import './css/App.css'
import './css/tailwind_output.css'
import { Input, Join, Theme, Button, Progress, Select } from 'react-daisyui'
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Alerts from './components/Alerts.jsx';

import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './components/Page';
import Footer from './components/Footer';
import setupRoot from './js/root.js'
import ConfirmModal from './components/ConfirmModal.jsx';
import WebSerialOverride from './js/WebSerialOverride.js';
import MpRawModeOverride from './js/MpRawModeOverride.js';


// Class that hold information about each game on the Arcade
class Game{
    //            `name`: the name of the game
    //  `descriptionURL`: the game's description
    //           `media`: .png or .webm video to display
    //    `fileURLsList`: list of full URLs to all the files the game needs to run
    constructor(name, size, descriptionURL, mediaURL, fileURLsList){
        this.name = name;
        this.size = size;
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
                <div className="flex h-full overflow-hidden arcade_media">
                    <video ref={display} autoPlay muted loop className="object-contain w-full h-auto rounded rounded-lg">
                        <source src="" type="video/webm"></source>
                    </video>
                </div>
            );
        }else if(game.mediaURL.indexOf(".mp4") != -1){
                return(
                    <div className="flex h-full overflow-hidden arcade_media">
                        <video ref={display} autoPlay muted loop className="object-contain w-full h-auto rounded rounded-lg">
                            <source src="" type="video/mp4"></source>
                        </video>
                    </div>
                );
        }else{
            return(
                <img ref={display} src="" className="object-cover w-full h-auto overflow-hidden rounded rounded-lg arcade_media">
                </img>
            );
        }
    }

    return(
        <div ref={ref} onClick={onClick} className={'flex flex-col w-[170px] h-[192px] bg-base-300 rounded rounded-lg m-auto outline outline-1 outline-base-100 hover:outline-success ' + className}>
            <div className="flex items-center w-full h-[22px] bg-base-300">
                <p className="ml-1 font-bold">{game.name}</p>
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
    const [filter, setFilter] = useState(undefined);

    let thumbyColorGames = useRef([]);
    let thumbyGames = useRef([]);
    let confirmModalRef = useRef(undefined);
    let alertsRef = useRef(undefined);

    let overwriteModelRef = useRef(undefined);

    const setClickedGameWrapper = (game) => {
        if(clickedGame != undefined && clickedGame.name == game.name){
            setClickedGame(undefined);
        }else{
            setClickedGame(game);
        }
    }


    const getURLQuery = (query) => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlSearchTerm = urlParams.get(query);
        return urlSearchTerm;
    }

    const setURLQuery = (query, value) => {
        const url = new URL(window.location.href);
        url.searchParams.set(query, value);
        window.history.pushState(null, '', url.toString());
    }

    const delURLQuery = (query) => {
        const url = new URL(window.location.href);
        url.searchParams.delete(query);
        window.history.pushState(null, '', url.toString());
    }


    // Whenever the user updates the search term
    // store the updated string using state which
    // rerenders the page and game list
    const onSerachType = (event) => {
        setSearchTerm(event.target.value);

        // Reset clicked game on typing since clicked
        // game may become not visible anymore
        setClickedGame(undefined);

        if(event.target.value != ""){
            setURLQuery("search", event.target.value);
        }else{
            delURLQuery("search");
        }
    }


    const onFilterChange = (event) => {
        // Reset clicked game on typing since clicked
        // game may become not visible anymore
        setClickedGame(undefined);

        setFilter(event.target.value);
        setURLQuery("platform", event.target.value);
    }


    const ifGameClickedStyle = (game) => {
        if(clickedGame == undefined){
            return "";
        }

        if(clickedGame.name == game.name){
            return "outline outline-2 outline-success";
        }
    }


    const renderGameIfAllowed = (game, gameIndex) => {
        // Search for games by what's in the URL query string
        const urlParams = new URLSearchParams(window.location.search);
        const urlSearchTerm = urlParams.get('search');

        // Only return game tiles when search term is empty
        // or when the term matches something in the game title
        if(urlSearchTerm == undefined || urlSearchTerm == "" || game.name.toLowerCase().indexOf(urlSearchTerm.toLowerCase()) != -1){
            return(
                <GameTile key={gameIndex} game={game} onClick={() => {setClickedGameWrapper(game)}} className={ifGameClickedStyle(game)}/>
            )
        }else{
            return undefined;
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
                    thumbyColorGames.current.map((game, gameIndex) => {
                        if(filter == "ThumbyColor"){
                            let tile = renderGameIfAllowed(game, gameIndex);

                            if(tile != undefined){
                                return tile;
                            }
                        }
                    })
                }

                {
                    thumbyGames.current.map((game, gameIndex) => {
                        if(filter == "Thumby"){
                            let tile = renderGameIfAllowed(game, gameIndex);

                            if(tile != undefined){
                                return tile;
                            }
                        }
                    })
                }
            </div>
        );
    }


    const parseURLList = (text, outputList) => {
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

            // #3: Find the size line of the game
            let gameSize = undefined;
            gameLines.forEach(line => {
                if(line.indexOf("SIZE=") != -1){
                    gameSize = Number(line.substring(5));
                }
            });
            
            // #4: Find the `arcade_description.txt` file (named exactly that). Do not
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

            // #5: Find any `.png` or `.webm` file for use for the game `icon`. Do not
            //     store or process any games without it. If both are found, use the
            //     `.webm` over the `.png`.
            let gamePNGURL = undefined;
            let gameVIDEOMURL = undefined;
            let gameMediaURL = undefined;
            gameLines.forEach(line => {
                if(line.indexOf(".png") != -1){
                    gamePNGURL = line;
                }

                if(line.indexOf(".webm") != -1 || line.indexOf(".mp4") != -1){
                    gameVIDEOMURL = line;
                }
            });

            if(gamePNGURL == undefined && gameVIDEOMURL == undefined){
                console.warn("WARNING: Game does not have a `.png`, `.webm`, or `.mp4`, not processing it:", gameName, gameLines);
                return;
            }

            if(gamePNGURL != undefined){
                gameMediaURL = gamePNGURL;
            }

            if(gameVIDEOMURL != undefined){
                gameMediaURL = gameVIDEOMURL;
            }

            // #6: Now that the `NAME=`, `arcade_description.txt`, `.png`, and `.webm` lines are
            //     all parsed/found. Filter the game URL text lines down to just the files needed
            //     to run the game
            let gameFileURLSList = gameLines.filter((line) => {
                if( line.indexOf("NAME=")                  != -1 ||
                    line.indexOf("SIZE=")                  != -1 ||
                    line.indexOf("arcade_description.txt") != -1 ||
                    line.indexOf(".png")                   != -1 ||
                    line.indexOf(".webm")                  != -1 ||
                    line.indexOf(".mp4")                   != -1){
                    return false;
                }else{
                    return true;
                }
            });

            // #7: Store the game info/URLs in a persistent location so we're
            //     not fetching stuff from GitHub all the time
            outputList.push(new Game(gameName, gameSize, gameDescriptionURL, gameMediaURL, gameFileURLSList));
        });
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
        if(thumbyColorGames.length > 0 && thumbyGames.length > 0){
            return;
        }

        fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Color-Games/refs/heads/main/url_list.txt").then(async (result) => {
            parseURLList(await result.text(), thumbyColorGames.current);
        }).then(() => {
            fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/refs/heads/master/url_list.txt").then(async (result) => {
                parseURLList(await result.text(), thumbyGames.current);
            }).then(() => {
                // Grab or set defaults
                if(getURLQuery("search") != null){
                    setSearchTerm(getURLQuery("search"));
                }else{
                    setSearchTerm(undefined);
                }
    
                if(getURLQuery("platform") != null){
                    setFilter(getURLQuery("platform"));
                }else{
                    setURLQuery("platform", "ThumbyColor");
                    setFilter("ThumbyColor");
                }
            });
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

        const serial = new WebSerialOverride((connected) => {});
        let rawMode = undefined;

        try {
            setDownloadingGame(true);

            await serial.connect([{ usbVendorId: 0x2E8A, usbProductId: 0x0003 }, { usbVendorId: 0x2E8A, usbProductId: 0x0005 }]);
            rawMode = await MpRawModeOverride.begin(serial);

            // List the contents of the root directory
            await rawMode.makePath("Games");
            const rootDirectoryContents = await rawMode.listDir('/');
            const gameDirectoryContents = await rawMode.listDir('Games');

            // Go through all the names and look for an overwrite
            for(let i=0; i<gameDirectoryContents.length; i++){
                let element = gameDirectoryContents[i];
                let elementName = element.name.replaceAll("'", "");

                if(elementName == clickedGame.name){
                    if(!await confirmModalRef.current.request("Game folder already exists, overwrite it?", "Overwrite", "Cancel")){
                        return;
                    }else{
                        break;
                    }
                }
            }

            // Go through all the names and look for a Thumby lib, ask to download if they would like
            let foundLib = false;

            for(let i=0; i<rootDirectoryContents.length; i++){
                let element = rootDirectoryContents[i];
                let elementName = element.name.replaceAll("'", "");

                if(elementName == "lib"){
                    foundLib = true;
                    break;
                }
            }

            // Ask and install `lib` folder if downloading a Thumby game without that installed
            if(filter == "Thumby" && !foundLib && await confirmModalRef.current.request("Thumby `lib` not installed, install it?", "Install", "No")){
                let manifestText = await (await fetch("/simulator/lib/manifest.txt")).text();
                let manifestLines = manifestText.split(/\r\n|\r|\n/);

                for(let i=0; i<manifestLines.length; i++){
                    let line = manifestLines[i];

                    if(line == ""){
                        continue;
                    }

                    let path = line.replace("/simulator/", "");
                    let data = new Uint8Array(await (await fetch(line)).arrayBuffer());

                    console.log(path);
                    await rawMode.makePath(path);
                    await rawMode.writeFile(path, data);
                }
                alertsRef.current.add("Thumby `lib` installed successfully!");
            }

            for(let i=0; i<clickedGame.fileURLsList.length; i++){
                const fileURL = clickedGame.fileURLsList[i];
                const gameFile = await fetch(fileURL);

                // Convert URL for either ThumbyColor or Thumby game to system file path
                let gameFilePath = fileURL;
                gameFilePath = gameFilePath.replace("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Color-Games/main/", "");
                gameFilePath = gameFilePath.replace("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/", "");
                gameFilePath = "Games/" + gameFilePath;

                // console.log(gameFilePath);
                await rawMode.makePath(gameFilePath);
                await rawMode.writeFile(gameFilePath, new Uint8Array(await gameFile.arrayBuffer()));
                window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: i / clickedGame.fileURLsList.length}}));
            }

            window.dispatchEvent(new CustomEvent("end_progress"));
            alertsRef.current.add("`" + clickedGame.name + "`" + " installed successfully!");
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // Close the connection
            setDownloadingGame(false);

            // Exit raw REPL mode
            if(rawMode) await rawMode.end();
            await serial.disconnect();
        }
    }


    const computerDownloadClicked = async (directoryHandle) => {
        setDownloadingGame(true);

        for(let i=0; i<clickedGame.fileURLsList.length; i++){
            const fileURL = clickedGame.fileURLsList[i];
            const gameFile = await fetch(fileURL);

            let gameFilePath = fileURL;
                gameFilePath = gameFilePath.replace("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Color-Games/main/" + clickedGame.name + "/", "");
                gameFilePath = gameFilePath.replace("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/" + clickedGame.name + "/", "");
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
                let handle = await directoryHandle.getDirectoryHandle(clickedGame.name);
                if(await confirmModalRef.current.request("Game folder already exists, overwrite it?", "Overwrite", "Cancel")){
                    computerDownloadClicked(handle);
                }
            }catch(exception){
                let handle = await directoryHandle.getDirectoryHandle(clickedGame.name, {create:true});
                computerDownloadClicked(handle);
            }            
        }catch(error){
            // Handle errors, e.g. user cancellation
            console.error('Error selecting directory:', error);
        }
    }


    return (
        <Page className="bg-repeat">
            <PageModalContents>
                <ConfirmModal ref={confirmModalRef}/>
            </PageModalContents>

            <PageHeaderContents>
                <div className='w-full h-full flex items-center'>
                    <div className="w-full h-full flex items-center">
                        <p className='text-lg font-bold ml-4'>Arcade</p>
                    </div>
                    <div className="w-full h-full flex items-center flex-row-reverse">
                        <Button size="sm" color='info' tag="a" target="" rel="noopener" href="/code/" className='mr-4'>
                            Editor
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                            </svg>
                        </Button>
                    </div>
                </div>
            </PageHeaderContents>

            <PageBodyContents>
                <Alerts ref={alertsRef}></Alerts>

                <div className="relative w-full h-full flex justify-center items-center">
                    <div className="absolute w-full top-0 bottom-12 flex flex-row justify-center">

                        <div className="min-w-[175px] max-w-[40%] w-[40%] h-full bg-base-200 flex flex-col">
                            {/* HEADER */}
                            <div className="w-full h-10 bg-base-300 flex items-center justify-evenly">
                                <Join>
                                    <p className='mx-2 flex justify-center items-center'>Search:</p>
                                    <Input defaultValue={getURLQuery("search")} onChange={onSerachType} size='sm' className='w-[65%]'/>
                                </Join>

                                <Join>
                                    <p className='mx-2 flex justify-center items-center'>Platform:</p>
                                    <Select className="mx-1" size="sm" value={filter} onChange={(event) => {onFilterChange(event)}}>
                                        <Select.Option value={"ThumbyColor"}>Thumby Color</Select.Option>
                                        <Select.Option value={"Thumby"}>Thumby</Select.Option>
                                    </Select>
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

                                    {
                                        clickedGame == undefined || clickedGame.size == undefined ?
                                            ""                                                    :
                                            <p className="text-sm ml-1">({((clickedGame.size/1000).toFixed(1))}kB)</p>
                                    }
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