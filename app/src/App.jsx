import { useState, useRef, Children, useCallback, useEffect} from 'react'
import './css/App.css'
import './css/tailwind_output.css'

import { Theme, Button, Modal, Progress, Input, Join} from 'react-daisyui'
import FilesPanel from './components/FilesPanel.jsx'
import TabPanel from './components/TabPanel.jsx'
import TerminalPanel from './components/TerminalPanel.jsx'
import SimulatorPanel from './components/SimulatorPanel.jsx'
import AddPanel from './components/AddPanel.jsx'
import CodePanel from './components/CodePanel.jsx'
import CustomModal from './components/CustomModal.jsx'
import { MpRawMode } from 'ViperIDE/src/rawmode.js'
import MpRawModeOverride from './js/MpRawModeOverride.js'
import SelectLocationModal from './components/SelectLocationModal.jsx'

import React from 'react';

import ComputerFiles from './js/computer_files.js'
import DeviceFiles from './js/device_files.js'
import WebSerialOverride from './js/WebSerialOverride.js'
import Footer from './components/Footer.jsx'
import setupRoot from './js/root.js'
import getDate from './js/utils/date.js'


import{
    getPanelElement,
    getPanelGroupElement,
    getResizeHandleElement,
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from "react-resizable-panels";

import Page, {PageHeaderContents, PageBodyContents, PageFooterContents, PageModalContents } from './components/Page.jsx'
import SettingsIcon from './components/SettingsIcon.jsx'
import UpdateModal from './components/UpdateModal.jsx'

export const Platform = {
    NONE: 0,
    COMPUTER: 1,
    THUMBY_COLOR: 2,
    THUMBY: 3
};

function App(props){
    const [tree, setTree] = useState([]);
    const [pathCheckedToRun, setPathCheckedToRun] = useState({path:"", isFolder:false});   // The path that was checked to run, can be a folder or file
    let allCheckedPaths = useRef([]);                               // A list of all the paths checked to run under `pathCheckedToRun` (including it)   

    const [progress, setProgress] = useState(0.0);

    let [computerFiles, setComputerFiles] = useState(undefined);
    let [deviceFiles, setDeviceFiles] = useState(undefined);
    let [mainFiles, setMainFiles] = useState(undefined);

    let [platform, setPlatform] = useState(Platform.NONE);

    // The active tab key
    const [activeEditorTabKey, setActiveEditorTabKey] = useState(0);
    const [activeTerminalTabKey, setActiveTerminalTabKey] = useState("Device"); // Focus device terminal by default

    const [currentMainPanel, setCurrentMainPanel] = useState("Code");

    const [errorMsg, setErrorMsg] = useState("No error, you shouldn't see this...");
    const [errorMsgDetails, setErrorMsgDetails] = useState("No error details, you shouldn't see this...");

    const errorModalRef = useRef(null);
    const updateModalRef = useRef(null);
    const choosePlatformModalRef = useRef(null);
    const xtermRefDevice = useRef(null);
    const xtermRefSimulator = useRef(null);

    let simulatorRef = useRef(undefined);

    const [runPathDevice, setRunPathDevice] = useState("");
    const [runPathSimulator, setRunPathSimulator] = useState("");

    const [runAfterLocationSelect, setRunAfterLocationSelect] = useState(undefined);    // Set this to show the location select model
    const [runLocationSelectTree, setRunLocationSelectTree] = useState(undefined);
    const [allFoldersOpen, setAllFoldersOpen] = useState(false);

    const [deviceUpdatable, setDeviceUpdatable] = useState(false);
    const [detectedDeviceVersion, setDetectedDeviceVersion] = useState("");
    
    // Whenever a path is checked to run or not run,
    // need to clear the run location that was set
    const setPathCheckedToRunWrapper = (value) => {
        setPathCheckedToRun(value);

        setRunPathDevice("");
        setRunPathSimulator("");
    }

    const chooseFilesPlatform = () => {
        choosePlatformModalRef.current?.showModal();
    }


    const addNewFile = () => {
        console.log("Add new file");
    }

    const openDeviceFile = async () => {
        console.log("Open device file");

        await deviceFiles.openFiles(setTree);               // Update internal tree
        setRunLocationSelectTree(deviceFiles.getTree());    // Set the tree to be rendered for selecting run location
    }

    const openComputerFile = () => {
        console.log("Open computer file");
    }

    const openSimulatorFile = async () => {
        console.log("Open simulator file");

        setRunLocationSelectTree(await simulatorRef.current.getTree());    // Set the tree to be rendered for selecting run location
        setRunAfterLocationSelect(() => runInSimulator);
    }

    const addTab = { id:"addTab", saved:true, closeable:false, children:{title:"+", component:<AddPanel addNewFile={addNewFile} openDeviceFile={openDeviceFile} openComputerFile={openComputerFile} openSimulatorFile={openSimulatorFile}/>} };
    const [editorTabsData, setEditorTabsData] = useState([addTab]);
    let editorValues = useRef({});  // Use ref so that rerender does not happen when saving editor states

    const [isSerialConnected, setIsSerialConnected] = useState(false);


    let serial = useRef(undefined);

    function onDeviceTerminalType(value){
        serial.current.write(value);
    }

    function onSimulatorTerminalType(value){
        simulatorRef.current.processChar(value);
    }

    const [terminalTabsData, setTerminalTabsData] = useState([
        { id: "Device", saved:true, children: {title:'Device Terminal', component:<TerminalPanel ref={xtermRefDevice} onData={onDeviceTerminalType} startMessage="Device Terminal"/>} },
        { id: "Simulator", saved:true, children: {title:'Simulator Terminal', component:<TerminalPanel ref={xtermRefSimulator} onData={onSimulatorTerminalType} startMessage="Simulator Terminal"/>}},
    ]);

    const onCodeEditorChanged = (path) => {
        // When an editor has its content changed, loop through all editor tabs
        // and add/set a `saved` attribute to `false` to show indicate that the
        // tab is not saved. Will be rendered with a `*`
        for(let i=0; i<editorTabsData.length; i++){
            if(editorTabsData[i].id == path){
                editorTabsData[i].saved = false;
                
                // Not sure why need to copy previous for other tabs to not disappear...
                // https://stackoverflow.com/questions/70948463/react-stale-state-issue-with-callback-passed-to-children
                // https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                setEditorTabsData((prevEditorTabsData) => {
                    return [...prevEditorTabsData];
                });
                break;
            }
        }
    }

    const onCodeEditorSaved = (path, valueToSave) => {
        mainFiles.saveFile(path, valueToSave).then(() => {
            // Go through and find the editor tab being saved based on `path` and tab `id`.
            // Set tab `saved` flag to `true` so that the `*` is removed 
            for(let i=0; i<editorTabsData.length; i++){
                if(editorTabsData[i].id == path){
                    editorTabsData[i].saved = true;
                    
                    // Not sure why need to copy previous for other tabs to not disappear...
                    // https://stackoverflow.com/questions/70948463/react-stale-state-issue-with-callback-passed-to-children
                    // https://legacy.reactjs.org/docs/hooks-reference.html#functional-updates
                    setEditorTabsData((prevEditorTabsData) => {
                        return [...prevEditorTabsData];
                    });
                    break;
                }
            }
        });
    }


    const switchToCodePanel = () => {
        setCurrentMainPanel("Code");
    }

    const switchToSimulatorPanel = () => {
        setCurrentMainPanel("Simulator");
    }


    // When a file in the files panel is opened, this gets called to add
    // a new code editor to `editorTabsData`. The code editor tab will need
    // access to `fileDataGetter` and `fileDataSetter` for getting and
    // setting data from/to the file on a computer or device
    const addCodeEditor = (path, name) => {
        // First, see if an editor tab has an `id` with the same path,
        // if so, do not add it but do focus it
        for(let i=0; i<editorTabsData.length; i++){
            if(editorTabsData[i].id == path){
                setActiveEditorTabKey(path); // Focus it
                switchToCodePanel();
                return;
            }
        }

        // Open file from whatever the current file handler class is,
        // then add it to all the current editor values for persistance
        // without rerender, then add the editor to the tabs and rerender
        // the tabs
        mainFiles.openFile(path).then((content) => {
            editorValues.current[path] = new TextDecoder().decode(content);
            let addTab = editorTabsData.pop();  // Remove the add tab (always at end)
            editorTabsData.push({ id:path, saved:true, closeable:true, children:{title:name, component:<CodePanel path={path} editorValues={editorValues.current} onCodeEditorChanged={onCodeEditorChanged} onCodeEditorSaved={onCodeEditorSaved}/>} })
            editorTabsData.push(addTab);        // Put the add tab back in (to keep it always at end)
            switchToCodePanel();
            setEditorTabsData([...editorTabsData]);
            setActiveEditorTabKey(path);
        })
    }


    function onSerialData(value){
        xtermRefDevice.current.write(value);
    }

    function onSerialActivity(){
        
    }

    function onSerialDisconnect(){
        console.log("Serial disconnect")

        serial.current.disconnect();
        setIsSerialConnected(false);

        // Reset this no matter what
        setRunPathDevice("");

        xtermRefDevice.current.write("\r\n--- DISCONNECTED ---");
    }

    // Whenever serial state changes, potentially remove file tree
    useEffect(() => {
        if(isSerialConnected){
            return;
        }

        // Reset all of these so that the editor is reset
        if(platform == Platform.THUMBY || platform == Platform.THUMBY_COLOR){
            editorValues.current = {};
            setTree([]);
            setEditorTabsData([addTab]);
            setPlatform(Platform.NONE);
        }

    }, [isSerialConnected])

    const connectSerial = async () => {
        if(serial.current == undefined){
            reportError("Serial not defined. You are likely not using a Chromium based browser. Please use a browser like Google Chrome or Microsoft Edge.");
        }else{
            try{
                try{
                    await serial.current.connect([{ usbVendorId: 0x2E8A, usbProductId: 0x0003 }, { usbVendorId: 0x2E8A, usbProductId: 0x0005 }]);
                }catch(error){
                    // https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open#exceptions
                    if(error.name == "InvalidStateError"){
                        reportError("Port is open in another tab, window, or program. Please disconnect this device from the other location: ", error);
                    }else if(error.name == "NetworkError"){
                        reportError("Failed to open port. It may be open in another tab, window, or program. Please disconnect this device from the other location:", error);
                    }else if(error.name == "TypeError"){
                        console.error("User did not select a port", error);
                    }else{
                        reportError("Unknown error while opening port: ", error);
                    }
                }
            }catch(error){
                // https://developer.mozilla.org/en-US/docs/Web/API/Serial/requestPort#exceptions
                if(error.name == "SecurityError"){
                    reportError("Security error while requesting ports...", error);
                }else if(error.name == "NotFoundError"){
                    console.error("User did not select a port", error);
                }else{
                    reportError("Unknown error while requesting port...", error);
                }
            }
        }
    }

    const handleSerialConnectButton = (event) => {
        if(isSerialConnected == false){
            connectSerial().then(() => {
                // Need this for if location to run computer files needs
                // selected
                let files = new DeviceFiles(serial.current, (percent) => {
                    if(percent < 1.0){
                        window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: percent}}));
                    }else{
                        window.dispatchEvent(new CustomEvent("end_progress"));
                    }
                });

                setDeviceFiles(files);
            })
        }else{
            serial.current.disconnect();
        }
    }

    function onSimulatorData(value){
        // Not sure if this is the way to do this, but it works...
        if(value[0] == 10){
            xtermRefSimulator.current.write('\r');
            xtermRefSimulator.current.write(value);
        }else{
            xtermRefSimulator.current.write(value);
        }
    }

    const openComputerFiles = () => {
        let files = new ComputerFiles((percent) => {
            if(percent < 1.0){
                window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: percent}}));
            }else{
                window.dispatchEvent(new CustomEvent("end_progress"));
            }
        });

        setComputerFiles(files);
        setMainFiles(files);

        files.openFiles(setTree, false).then(() => {
            choosePlatformModalRef.current?.close();

            // Set this so that the files panel header renders with the correct platform
            setPlatform(Platform.COMPUTER);

            // Get rid of any editor tabs that existed before
            setEditorTabsData([addTab]);
            editorValues.current = {};

            // Get rid of any path that was set to run
            setPathCheckedToRunWrapper({path:"", isFolder:false});
        });
    }

    const openDeviceFiles = () => {
        connectSerial().then(async () => {
            let files = new DeviceFiles(serial.current, (percent) => {
                if(percent < 1.0){
                    window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: percent}}));
                }else{
                    window.dispatchEvent(new CustomEvent("end_progress"));
                }
            });

            setDeviceFiles(files);
            setMainFiles(files);

            // Detect the platform
            let rawMode = await MpRawModeOverride.begin(serial.current);
            let platform = await rawMode.platform();
            let dateVersion = await rawMode.dateVersion(platform);
            await rawMode.showEditorConnected(platform);
            rawMode.end();

            setPlatform(platform);

            if(platform == Platform.THUMBY_COLOR){
                let versions = await (await fetch("/firmware/versions.json")).json();

                const latest_fimrware_date = getDate(versions[0]["date"]);
                const firmware_date = getDate(dateVersion);
                
                setDetectedDeviceVersion(dateVersion);

                if(firmware_date < latest_fimrware_date){
                    setDeviceUpdatable(true);
                }
            }else{

            }

            console.log("Opening device files...");
            await serial.current.reset();
            files.openFiles(setTree).then(() => {
                console.log("Opened device files!");
                choosePlatformModalRef.current?.close();

                // Get rid of any editor tabs that existed before
                setEditorTabsData([addTab]);
                editorValues.current = {};

                // Get rid of any path that was set to run
                setPathCheckedToRunWrapper({path:"", isFolder:false});
            })
        });
    }

    const getFilesPanelTitle = () => {
        const getTitle = () => {
            if(platform == Platform.NONE){
                return "Files";
            }else if(platform == Platform.COMPUTER){
                return "Files: Computer";
            }else if(platform == Platform.THUMBY_COLOR){
                return "Files: Thumby Color";
            }else if(platform == Platform.THUMBY){
                return "Files: Thumby";
            }
        }

        return(
            <div className="w-full h-full flex items-center">
                <div className="flex-1">
                    {getTitle()}
                </div>

                <Button size='xs' color='neutral' title='Refresh the filesystem' className='mr-1' onClick={() => {if(mainFiles != undefined) mainFiles.openFiles(setTree, true)}} disabled={platform == Platform.NONE}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
                    </svg>
                </Button>

                <Button size='xs' color='neutral' title='Toggle all folders open or closed' onClick={() => {setAllFoldersOpen(!allFoldersOpen)}} disabled={platform == Platform.NONE}>
                    {
                        allFoldersOpen ?
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v3.26a3.235 3.235 0 0 1 1.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75ZM3.75 9A1.75 1.75 0 0 0 2 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-4.5A1.75 1.75 0 0 0 16.25 9H3.75Z" />
                        </svg>
                                        :
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path d="M4.75 3A1.75 1.75 0 0 0 3 4.75v2.752l.104-.002h13.792c.035 0 .07 0 .104.002V6.75A1.75 1.75 0 0 0 15.25 5h-3.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H4.75ZM3.104 9a1.75 1.75 0 0 0-1.673 2.265l1.385 4.5A1.75 1.75 0 0 0 4.488 17h11.023a1.75 1.75 0 0 0 1.673-1.235l1.384-4.5A1.75 1.75 0 0 0 16.896 9H3.104Z" />
                        </svg>  
                    }
                </Button>

                <div className={"w-14 flex justify-center items-center " + (platform == Platform.NONE ? "opacity-30" : "")}>
                    <p>RUN</p>
                </div>
            </div>
        );
    }


    // From the checked paths, figure out which file is the one to run and also
    // get all the data for each checked file as well as their full paths for running
    const getRunFileAndCheckedData = async (openFiles) => {
        // Need to find this
        let fullPathToRunFile = "";

        // Need to fill this with {path:full_file_path, data:Uint8Array}
        let file_list = [];

        // If a Python file is checked to run, run that directly, otherwise,
        // a folder is checked and we need to run the file that is named
        // `main.py` or the same as the folder, or open manifest.ini and
        // see if the file to run is in there
        if(pathCheckedToRun.isFolder == false){  // File
            fullPathToRunFile = pathCheckedToRun.path;
            file_list = [{path:pathCheckedToRun.path, data:await mainFiles.openFile(pathCheckedToRun.path)}];
        }else{                                      // Folder
            // Check to see if there's a file directly in the selected
            // folder called `main.py`, folder name + ".py" or if there
            // is a `manifest.ini` with a main file indicated
            for(let icx=0; icx<allCheckedPaths.current.length; icx++){
                // Do not care about doing anything directly with folders
                if(allCheckedPaths.current[icx].isFolder){
                    continue;
                }

                let filePath = allCheckedPaths.current[icx].path;
                let lastIndexOfSlash = filePath.lastIndexOf("/");
                let secondToLastIndexOfSlash = filePath.lastIndexOf("/", lastIndexOfSlash-1);
                let path = filePath.substring(0, lastIndexOfSlash);
                let folder_name = filePath.substring(secondToLastIndexOfSlash+1, lastIndexOfSlash);

                // Only care about checking files that have the same path
                // as the folder its in and not in any sub folders
                if(path != pathCheckedToRun.path){
                    continue;
                }

                // If this path is in the selected folder (above) and it is `main.py`, use this and stop looking
                if(filePath.indexOf("main.py") != -1){
                    fullPathToRunFile = filePath;
                    break;
                }

                // If this path is in the selected folder (above) and it is a file that's the folder name + ".py",
                // use this and stop looking
                if(filePath.indexOf(folder_name + ".py") != -1){
                    fullPathToRunFile = filePath;
                    break;
                }

                // If this path is in the selected folder (above) and it is a manifest file, open it and check for
                // main file and build full path to it
                if(filePath.indexOf("manifest.ini") != -1){
                    let fileData = await mainFiles.openFile(filePath);
                    fileData = new TextDecoder().decode(fileData);
                    fileData = fileData.split(/\r\n|\r|\n/);             // https://stackoverflow.com/a/52947649

                    fileData.forEach(line => {
                        if(line.indexOf("main") != -1){
                            let noSpacesLine = line.replace(/\s+/g, ''); // https://stackoverflow.com/a/5963202
                            let mainFileName = noSpacesLine.substring(noSpacesLine.indexOf("=")+1);
                            fullPathToRunFile = path + "/" + mainFileName;
                        }
                    });
                }
            }

            // Error if a file to run was not found
            if(fullPathToRunFile == ""){
                window.dispatchEvent(new CustomEvent("show_error", {detail: {customMessage: "Did not find a file to run!", errorStr: "Looked for `main.py`, Python file with same name as parent folder, and for a main file in a `manifest.ini` file"}}));
                return;
            }

            // Open all the files to be copied to the runner but only
            // if the passed flag says to open them
            if(openFiles){
                for(let icx=0; icx<allCheckedPaths.current.length; icx++){
                    if(allCheckedPaths.current[icx].isFolder == false){
                        let fulFilePath = allCheckedPaths.current[icx].path;
                        let data = await mainFiles.openFile(fulFilePath);
                        file_list.push({path:fulFilePath, data:data});
                    }
                }
            }
        }

        // Return
        return [file_list, fullPathToRunFile];
    }


    const runDevice = (files, filePathToRun) => {
        console.log("Going into raw mode to run on device...");
        MpRawMode.begin(serial.current).then(async (raw_mode) => {
            console.log("In raw mode, starting file upload...");

            // Only if the file system panel has computer files
            // open do we want to upload the files to the device
            // before running
            if(platform == Platform.COMPUTER){
                for(let ifx=0; ifx<files.length; ifx++){
                    console.log(files[ifx]);
                    let fileDirPath = files[ifx].path.substring(0, files[ifx].path.lastIndexOf("/"));
                    await raw_mode.makePath(fileDirPath);
                    await raw_mode.writeFile(files[ifx].path, files[ifx].data, 1024);
                    window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: ifx/(files.length-1)}}));
                }
            }

            window.dispatchEvent(new CustomEvent("end_progress"));

            let run_dir_path = filePathToRun.substring(0, filePathToRun.lastIndexOf("/"));

            console.log("Running...");
            await serial.current.write(`
import sys
import os
import engine_save
engine_save._init_saves_dir("/Saves/` + run_dir_path + `")
sys.path.append("` + run_dir_path + `")
os.chdir("` + run_dir_path + `")
execfile("` + filePathToRun + `")
`);
            await serial.current.write('\x04')         // Ctrl-D: execute
            await raw_mode.end();
        });
    }


    const formatCheckedToSelected = (files, filePathToRun, selectedRunPath) => {
        // If the device run path is defined, go through all all files
        // and change their paths to be run at that location
        if(selectedRunPath != undefined){
            // 1. If the selected to run main file is:
            //    `/Games/Collision/main.py`
            //    then `/Games/Collision/` needs to be replaced with `selectedRunPath`
            // 2. If the selected to run main folder is:
            //    `/Games/Collision`
            //    then all files inside of that needs the portions of their
            //    paths with `/Games/Collision` replaced with `selectedRunPath`
            let pathPortionToReplace = "";

            // Figure out common path portion to replace in all files
            if(pathCheckedToRun.isFolder){
                pathPortionToReplace = pathCheckedToRun.path;
            }else{
                pathPortionToReplace = pathCheckedToRun.path.substring(0, pathCheckedToRun.path.lastIndexOf("/"));
            }

            // Edit the paths
            files.forEach(file => {
                file.path = file.path.replace(pathPortionToReplace, selectedRunPath);
            });

            filePathToRun = filePathToRun.replace(pathPortionToReplace, selectedRunPath);
        }

        return [files, filePathToRun];
    }


    const runOnDevice = async (selectedRunPath) => {
        setRunPathDevice(selectedRunPath);

        console.log("Run on device", pathCheckedToRun.path, allCheckedPaths.current);

        // Since we're running on the device, if the files
        // to run are open on the computer, we need to open
        // and upload them, otherwise we don't (does not make
        // sense to open files on device if we are running
        // on the device)
        let openFiles = platform == Platform.COMPUTER;

        let [files, filePathToRun] = await getRunFileAndCheckedData(openFiles);

        if(files != undefined){
            [files, filePathToRun] = formatCheckedToSelected(files, filePathToRun, selectedRunPath);
            setActiveTerminalTabKey("Device");
            runDevice(files, filePathToRun);
        }
    }

    const onRunOnDevice = async () => {
        // Show error if nothing checked to run
        if(allCheckedPaths.current.length == 0){
            window.dispatchEvent(new CustomEvent("show_error", {detail: {customMessage: "Nothing checked to run"}}));
            return;
        }

        console.log("Resetting to prepare to run...");
        await serial.current.reset();
        console.log("Reset!");

        // If the user chose files from the computer and the path has not
        // been set yet, ask the user to select a path on the device to run
        // the files at
        console.log("Preparing to run...");
        if(runPathDevice == "" && platform == Platform.COMPUTER){
            await deviceFiles.openFiles(setTree);               // Update internal tree
            setRunLocationSelectTree(deviceFiles.getTree());    // Set the tree to be rendered for selecting run location
            setRunAfterLocationSelect(() => runOnDevice);
        }else{
            // Only want the path, so get rid of file name in path is a file
            if(pathCheckedToRun.isFolder == false){
                runOnDevice(pathCheckedToRun.path.substring(0, pathCheckedToRun.path.lastIndexOf("/")));
            }else{
                runOnDevice(pathCheckedToRun.path);
            }
        }
    }


    const deviceSyncRTCClick = () => {MpRawModeOverride
        let date = new Date();
        let datetime = '(' + date.getFullYear() + ',' + (date.getMonth()+1) + ',' + date.getDate() + ',' + date.getHours() + ',' + date.getMinutes() + ',' + date.getSeconds() + ')';
        console.log(datetime);

        MpRawMode.begin(serial.current).then(async (raw_mode) => {
            window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: 0.5}}));

            await raw_mode.exec(`
import engine_main
import engine_time
engine_time.datetime(` + datetime + `)
            `, 0, false);
            await raw_mode.end();

            window.dispatchEvent(new CustomEvent("end_progress"));
        });
    }


    const runInSimulator = async (selectedRunPath) => {
        setRunPathSimulator(selectedRunPath);

        console.log("Run in simulator", pathCheckedToRun.path, allCheckedPaths.current);

        let [files, filePathToRun] = await getRunFileAndCheckedData(true);

        if(files != undefined){
            // Switch UI
            [files, filePathToRun] = formatCheckedToSelected(files, filePathToRun, selectedRunPath);
            switchToSimulatorPanel();
            setActiveTerminalTabKey("Simulator");
            simulatorRef.current.runSimulator(files, filePathToRun);
        }
    }

    const onRunInSimulator = async () => {
        // Show error if nothing checked to run
        if(allCheckedPaths.current.length == 0){
            window.dispatchEvent(new CustomEvent("show_error", {detail: {customMessage: "Nothing checked to run"}}));
            return;
        }

        // if(runPathSimulator == ""){
        console.log("Waiting on simulator tree...");
        setRunLocationSelectTree(await simulatorRef.current.getTree());    // Set the tree to be rendered for selecting run location
        setRunAfterLocationSelect(() => runInSimulator);
        // }else{
        //     console.error(pathCheckedToRun);

        //     // Only want the path, so get rid of file name in path is a file
        //     if(pathCheckedToRun.isFolder == false){
        //         runInSimulator(pathCheckedToRun.path.substring(0, pathCheckedToRun.path.lastIndexOf("/")));
        //     }else{
        //         runInSimulator(pathCheckedToRun.path);
        //     }
        // }
    }


    const handleShowErrorMsg = useCallback(() => {
        errorModalRef.current.showModal();
        console.log(errorMsg);
    }, [errorModalRef]);

    useEffect(() => {
        window.addEventListener("show_error", (event) => {
            setErrorMsg(event.detail.customMessage);
            setErrorMsgDetails(event.detail.errorStr);
            handleShowErrorMsg();
        });

        window.addEventListener("set_progress", (event) => {
            setProgress(event.detail.progress);
        });

        window.addEventListener("end_progress", (event) => {
            setProgress(1.0);

            setTimeout(() => {
                setProgress(0.0)
            }, 250);
        });

        try{
            if(serial.current == undefined){
                serial.current = new WebSerialOverride((value) => {setIsSerialConnected(value)});
                serial.current.receiveCallback = onSerialData;
                serial.current.activityCallback = onSerialActivity;
                serial.current.disconnectCallback = onSerialDisconnect;
            }
        }catch(error){
            console.error(error);
        }
    }, []);


    return(
        <Page>
            <PageModalContents>
                <SelectLocationModal pathCheckedToRun={pathCheckedToRun} runAfterLocationSelect={runAfterLocationSelect} setRunAfterLocationSelect={setRunAfterLocationSelect} runLocationSelectTree={runLocationSelectTree}/>
                <UpdateModal serial={serial.current} platform={platform} detectedDeviceVersion={detectedDeviceVersion} ref={updateModalRef}/>

                {/* ### Error modal ### */}
                <CustomModal title="ERROR:" titleColor="error" outlineColor="error" ref={errorModalRef}>
                    <div className="text-error">
                        {errorMsg}

                        {errorMsgDetails != undefined ? (<details>
                                                            <summary>Error Details</summary>
                                                            {errorMsgDetails}
                                                        </details>) 
                                                    : <></>}
                    </div>
                </CustomModal>


                {/* ### Choose platform modal ### */}
                <CustomModal title="Choose platform to open folder from:" outlineColor="base-content" ref={choosePlatformModalRef}>
                    <div className="w-full h-full flex flex-row justify-evenly">
                        <Button size="lg" onClick={openComputerFiles} variant='outline'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pc-display-horizontal" viewBox="0 0 16 16">
                                <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v7A1.5 1.5 0 0 0 1.5 10H6v1H1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5v-1h4.5A1.5 1.5 0 0 0 16 8.5v-7A1.5 1.5 0 0 0 14.5 0zm0 1h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5M12 12.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0m2 0a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0M1.5 12h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M1 14.25a.25.25 0 0 1 .25-.25h5.5a.25.25 0 1 1 0 .5h-5.5a.25.25 0 0 1-.25-.25"/>
                            </svg>
                            <p>Computer</p>
                        </Button>

                        <Button size="lg" onClick={openDeviceFiles} variant='outline'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cpu-fill" viewBox="0 0 16 16">
                                <path d="M6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
                                <path d="M5.5.5a.5.5 0 0 0-1 0V2A2.5 2.5 0 0 0 2 4.5H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2v1H.5a.5.5 0 0 0 0 1H2A2.5 2.5 0 0 0 4.5 14v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14h1v1.5a.5.5 0 0 0 1 0V14a2.5 2.5 0 0 0 2.5-2.5h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14v-1h1.5a.5.5 0 0 0 0-1H14A2.5 2.5 0 0 0 11.5 2V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1V.5a.5.5 0 0 0-1 0V2h-1zm1 4.5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3A1.5 1.5 0 0 1 6.5 5"/>
                            </svg>
                            <p>Device</p>
                        </Button>
                    </div>
                </CustomModal>
            </PageModalContents>



            <PageHeaderContents>
                <div className="w-full h-16 border-b-base-300 border-b-4 flex items-center">
                    <div className="h-full flex-1 flex flex-row items-center">
                        <Button className="ml-2" size="sm" color="primary" onClick={chooseFilesPlatform} title="Open a folder from your computer or MicroPython device">
                            Open Location
                        </Button>

                        <Join>
                            <Button onClick={handleSerialConnectButton} disabled={(platform == Platform.NONE) ? true : false} className="ml-2" size='sm' color="primary" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px"}}>
                                {isSerialConnected == false ? <p>Connect</p> : <p>Disconnect</p>}
                            </Button>
                            <Button onClick={onRunOnDevice} disabled={(platform == Platform.NONE || isSerialConnected == false) ? true : false} size='sm' color="primary" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px", borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                                Run
                            </Button>
                            <Input value={runPathDevice} className='w-24' disabled={(platform == Platform.NONE || isSerialConnected == false) ? true : false} size="sm" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px", borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                            </Input>
                        </Join>

                        <Join>
                            <Button onClick={onRunInSimulator} disabled={platform == Platform.NONE ? true : false} className="ml-2" size='sm' color="primary" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px"}}>
                                Simulate
                            </Button>
                            <Input value={runPathSimulator} className='w-24' disabled={platform == Platform.NONE ? true : false} size="sm" style={{borderTopRightRadius:"0px", borderBottomRightRadius:"0px", borderTopLeftRadius:"0px", borderBottomLeftRadius:"0px"}}>
                            </Input>
                        </Join>
                    </div>

                    <div className="h-full flex-1 flex flex-row justify-center items-center">

                        <Button title="Code panel" variant={currentMainPanel == "Code" ? "outline" : ""} onClick={switchToCodePanel} size='md' color="secondary" shape="square">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-code-slash" viewBox="0 0 16 16">
                                <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0"/>
                            </svg>
                        </Button>
                        <Button title="Simulator panel" variant={currentMainPanel == "Simulator" ? "outline" : ""} onClick={switchToSimulatorPanel} size='md' color="secondary" shape="square" className="mx-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pc-horizontal" viewBox="0 0 16 16">
                                <path d="M1 6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm11.5 1a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1m2 0a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1M1 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5M1.25 9h5.5a.25.25 0 0 1 0 .5h-5.5a.25.25 0 0 1 0-.5"/>
                            </svg>
                        </Button>
                    </div>

                    <div className="h-full flex-1 flex flex-row items-center justify-end">
                        <SettingsIcon className='mr-4' connected={isSerialConnected} deviceUpdatable={deviceUpdatable} onUpdateClick={() => {updateModalRef.current.showModal()}} deviceSyncRTCClick={deviceSyncRTCClick}/>

                        <Button size="sm" color='info' tag="a" target="_blank" rel="noopener" href="/code/arcade/" className='mr-4'>
                            Arcade
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                            </svg>
                        </Button>
                    </div>
                </div>
            </PageHeaderContents>



            <PageBodyContents>
                <div className="w-full h-full flex flex-col" style={{scrollbarWidth:"0px"}}>
                    {/* ### Main panel group ### */}
                    <PanelGroup direction="horizontal">
                        
                        {/* ### Left panel group ### */}
                        <Panel className="bg-base-100" defaultSize={17} minSize={2} maxSize={98}>
                            <PanelGroup direction="vertical">

                                {/* ### File panel ### */}
                                <Panel className="bg-base-100 w-full h-full" minSize={2} maxSize={98}>
                                    <div className="pl-1 w-full h-8 bg-base-200 flex items-center font-bold text-nowrap select-none">
                                        {getFilesPanelTitle()}
                                    </div>

                                    <FilesPanel showRoot={true} mainFiles={mainFiles} deviceFiles={deviceFiles} computerFiles={computerFiles} tree={tree} setTree={setTree} addCodeEditor={addCodeEditor} pathCheckedToRun={pathCheckedToRun} setPathCheckedToRun={setPathCheckedToRunWrapper} allCheckedPaths={allCheckedPaths.current} allFoldersOpen={allFoldersOpen} platform={platform} isSerialConnected={isSerialConnected}/>
                                </Panel>
                            </PanelGroup>

                        </Panel>

                        <PanelResizeHandle className="w-1 bg-base-300"/>

                        {/* Right panel group */}
                        <Panel>
                            <PanelGroup direction="vertical">
                                <Panel className="bg-base-100" defaultSize={71.8} minSize={2} maxSize={98}>
                                    <div className={"w-full h-full relative"}>

                                        {/* CODE PANEL */}
                                        <div className={"left-0 right-0 top-0 bottom-0 absolute " + (currentMainPanel == "Code" ? "z-10" : "z-0 invisible")}>
                                            <div className="left-0 right-0 top-0 bottom-0 z-20 absolute opacity-5" style={{backgroundImage:"url(\"logo.svg\")", backgroundRepeat:"no-repeat", backgroundPosition:"center", backgroundSize:"22%", backgroundBlendMode:"multiply"}}>
                                            </div>
                                            <div className="left-0 right-0 top-0 bottom-0 z-30 absolute">
                                                <TabPanel tabsData={editorTabsData} setTabsData={setEditorTabsData} draggable={false} closeable={true} activeTabKey={activeEditorTabKey} setActiveTabKey={setActiveEditorTabKey} unselectable={false}/>
                                            </div>
                                        </div>

                                        {/* SIMULATOR PANEL */}
                                        <div className={"left-0 right-0 top-0 bottom-0 absolute " + (currentMainPanel == "Simulator" ? "z-10" : "z-0 invisible")}>
                                            <div className="left-0 right-0 top-0 bottom-0 z-20 absolute">
                                                <SimulatorPanel ref={simulatorRef} onData={onSimulatorData}/>
                                            </div>
                                        </div>

                                    </div>
                                </Panel>

                                <PanelResizeHandle className="h-1 bg-base-300" />

                                <Panel className="bg-base-100" defaultSize={28.2} minSize={2} maxSize={98} onResize={() => document.dispatchEvent(new Event("terminal-panel-resized"))}>
                                    <TabPanel tabsData={terminalTabsData} setTabsData={setTerminalTabsData} draggable={false} closeable={false} activeTabKey={activeTerminalTabKey} setActiveTabKey={setActiveTerminalTabKey}/>
                                </Panel>
                            </PanelGroup>
                        </Panel>
                    </PanelGroup>
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
    );
}


export default App

setupRoot(<App/>);