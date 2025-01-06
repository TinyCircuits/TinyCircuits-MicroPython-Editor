import './App.css'
import './tailwind_output.css'
import { Input, Join, Theme, Button } from 'react-daisyui'
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents} from './Page';
import Footer from './Footer';
import setupRoot from './root';


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
    }
}


function GameTile(props){
    const {game} = props;

    const ref = useRef(null);
    const media = useRef(null);
    const display = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);

                // When the game tile is in view and its thumbnail has
                // not been loaded yet, load it, store it, and display
                if(entry.isIntersecting && media.current == null){
                    fetch(game.mediaURL).then(async (result) => {
                        media.current = URL.createObjectURL(await result.blob())
                        console.log(media.current);
                        console.log(game.name);
                        console.log(display.current);

                        display.current.setAttribute("src", media.current);

                        // Only play videos if it is a video
                        if(display.current.tagName == "video"){
                            display.current.load();
                        }
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
        <div ref={ref} className='flex flex-col w-[170px] h-[190px] bg-base-300 rounded rounded-lg m-auto outline outline-1 outline-base-100 hover:outline-success'>
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
    let games = useRef([]);


    // Whenever the user updates the search term
    // store the updated string using state which
    // rerenders the page and game list
    const onSerachType = (event) => {
        setSearchTerm(event.target.value);

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
                                <GameTile key={gameIndex} game={game}/>
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


    return (
        <Page className="bg-repeat">
            <PageHeaderContents>
                <div className='w-full h-full flex items-center'>
                    <div className="w-full h-full flex items-center">
                        <p className='text-lg font-bold ml-4'>Arcade</p>
                    </div>
                    <div className="w-full h-full flex items-center flex-row-reverse">
                        <Button size="sm" color='primary' tag="a" target="" rel="noopener" href="/" className='mr-4'>
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

                        <div className="min-w-[175px] max-w-[50%] w-[50%] h-full bg-base-200 flex flex-col">
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

                        <div className="min-w-[325px] w-[325px] h-full bg-base-300 flex flex-col">
                            {/* HEADER */}
                            <div className="w-full h-10 bg-base flex items-center">
                            </div>

                            {/* BODY */}
                            <div className="w-full h-full bg-base-300">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </PageBodyContents>

            <PageFooterContents>
                <Footer />
            </PageFooterContents>
        </Page>
    )



    // return (
    //     <Page>
    //         <PageHeaderContents>
    //             <div className='w-full h-full flex items-center'>
    //                 <p className='text-lg font-bold ml-4'>Arcade</p>
    //             </div>
    //         </PageHeaderContents>

    //         <PageBodyContents>
    //             <div className="w-full h-full flex justify-center items-center">
    //                 <div className='absolute min-w-[400px] w-4/6 top-2 bottom-10 bg-base-300 flex flex-col m-auto'>
    //                     {/* Header */}
    //                     <div className='w-full h-12 bg-base-200 flex items-center'>
    //                         <Join>
    //                             <p className='mx-2 flex justify-center items-center'>Search:</p>
    //                             <Input onChange={onSerachType} size='sm'/>
    //                         </Join>
                            
    //                     </div>

    //                     <div className='flex w-full h-full'>
    //                         <div className="w-full min-w-[300px] h-full bg-base-200">
    //                         </div>

    //                         <div className="min-w-[400px] w-[400px] h-full bg-base-300">
                                
    //                         </div>
    //                     </div>

    //                     {/* Body */}
    //                     {renderGameList()}
    //                 </div>
    //             </div>
    //         </PageBodyContents>

    //         <PageFooterContents>
    //             <Footer />
    //         </PageFooterContents>
    //     </Page>
    // )
}


export default Arcade

setupRoot(<Arcade/>);