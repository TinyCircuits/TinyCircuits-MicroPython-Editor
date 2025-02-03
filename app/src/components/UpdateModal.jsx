import CustomModal from "./CustomModal";
import { Platform } from "../App";
import { forwardRef, useRef, useImperativeHandle, useState, useEffect } from "react";
import { Select, Button } from "react-daisyui";
import MpRawModeOverride from "../js/MpRawModeOverride";


let UpdateModal = forwardRef(function UpdateModal(props, ref){
    const {serial, platform, detectedDeviceVersion={detectedDeviceVersion}} = props;
    const customModalRef = useRef(null);
    const [versions, setVersions] = useState([]);   // Consists of [{"date":, "commit_id":, "changelog":}, ...]
    const [selectedVersion, setSelectedVersion] = useState({"date":"", "commit_id":"", "changelog":""});
    const [step, setStep] = useState(0);

    const title = () => {
        if(platform == Platform.THUMBY_COLOR){
            return "Thumby Color";
        }else if(platform == Platform.THUMBY){
            return "Thumby";
        }
    }

    useImperativeHandle(ref, () => ({
        showModal(){
            customModalRef.current.showModal();
        },
        close(){
            customModalRef.current.close();
        },
    }), []);

    const setupVersions = async () => {
        let versions = await (await fetch("/firmware/versions.json")).json();
        setVersions(versions);
        setSelectedVersion(versions[0]);
    }

    const formatVersionChangelog = (changelog) => {
        changelog = changelog.split(/\r\n|\r|\n/);

        return changelog.map((line, index) => {
            return(
                <div key={index} className="w-full h-fit my-1 flex flex-row">
                    <div className="w-min h-full mt-2 mr-1">
                        <div className="w-2 h-2 aspect-square rounded rounded-full bg-neutral-content"></div>
                    </div>
                    <div className="w-full h-fit">
                        <span>{line}</span>
                    </div>
                </div>
            )
        });
    }

    const getVersionByDate = (date) => {
        for(let i=0; i<versions.length; i++){
            if(versions[i]["date"] == date){
                return versions[i];
            }
        }
    }

    // `selectedVersions` = {"date":, "commit_id":, "changelog":}
    const startUpdate = async () => {
        // customModalRef.current.close();

        const commit_id = selectedVersion["commit_id"];
        
        const firmwarePath     = "/firmware/" + commit_id + "/firmware_" + commit_id + ".uf2";
        const baseFilePath     = "/firmware/" + commit_id + "/filesystem/";
        const fileManifestPath = baseFilePath + "manifest.txt";

        const firmware = await fetch(firmwarePath);
        const fileManifest = await (await fetch(fileManifestPath)).text();
        const fileManifestPaths = fileManifest.split(/\r\n|\r|\n/); 


        // Delete files to be re-downloaded, put into BOOTSEL mode
        await MpRawModeOverride.begin(serial).then(async (raw_mode) => {
            setStep(1);
            await raw_mode.deleteFileOrDir("/main.py");
            await raw_mode.deleteFileOrDir("/system");

            setStep(2);
            for(let i=0; i<fileManifestPaths.length; i++){
                const fetchPath = fileManifestPaths[i];
                const filePath = fetchPath.replace(baseFilePath, "");
                const fileData = await (await fetch(fetchPath)).arrayBuffer();

                if(filePath.length == 0 || filePath == ""){
                    continue;
                }

                await raw_mode.makePath(filePath);
                await raw_mode.writeFile(filePath, fileData);
            }

            setStep(3);
            await raw_mode.bootloader();
        });
    }

    useEffect(() => {
        setStep(0);
        setupVersions();
    }, []);


    const mainScreen = () => {
        return(
            <div className="flex flex-col items-center justify-center">
                <div className="w-fit flex-1 flex flex-col items-center justify-center bg-base-200 p-2 rounded rounded-lg">
                    <div>
                        <span><b>Current device version:</b></span>
                    </div>
                    <div>
                        <span>{detectedDeviceVersion}</span>
                    </div>
                </div>

                {/* <div className="w-full flex-1 flex flex-col items-center justify-center mt-2 mb-2"> */}
                    <div className="w-full h-fit rounded rounded-lg bg-base-300 p-2 mt-2">
                        <div className="w-full h-fit flex items-center justify-center">
                            <Select size="sm" value={selectedVersion["date"]} onChange={event => setSelectedVersion(getVersionByDate(event.target.value))}>
                                {
                                    versions.map((version, index) => {
                                        return(
                                            <Select.Option key={index} value={version["date"]}>
                                                {index == 0 ? "Latest: " : ""}
                                                {version["date"]}
                                            </Select.Option>
                                        );
                                    })
                                }
                            </Select>
                        </div>
                        
                        <div className="w-full h-6">
                            <span className="font-bold">Changelog:</span>
                        </div>
                        <div className="w-full h-fit max-h-96 overflow-y-auto">
                            {formatVersionChangelog(selectedVersion["changelog"])}
                        </div>
                    </div>
                {/* </div> */}

                <div className="w-full flex-1 flex items-center justify-center my-2">
                    <Button color="primary" onClick={startUpdate}>Update</Button>
                </div>

                <div className="w-full flex-1 text-sm">
                    <span><b>NOTE:</b> this will delete and update the <b>/main.py</b> file and <b>/system</b> folder but will not affect any other files or folders</span>
                </div>
            </div>
        );
    }

    const dropUF2 = async () => {
        const commit_id = selectedVersion["commit_id"];
        const fimrwareFileName = "firmware_" + commit_id + ".uf2";
        const firmwarePath     = "/firmware/" + commit_id + "/" + fimrwareFileName;
        const firmware = await fetch(firmwarePath);

        const dirHandle = await window.showDirectoryPicker({mode:"readwrite", startIn:"downloads"});
        setStep(4);
        const fileHandle = await dirHandle.getFileHandle(fimrwareFileName, {create:true});
        const writable = await fileHandle.createWritable();
        await writable.write(await firmware.arrayBuffer());
        await writable.close();
        setStep(5);
    }

    const step1 = () => {
        return(
            <div key={0} className="flex flex-col items-center justify-center">
                <span className="font-bold text-lg">Updating, do not unplug!</span>
                <span className="font-bold">Step 1: Deleting old files...</span>
            </div>
        )
    }
    
    const step2 = () => {
        return(
            <div key={1} className="flex flex-col items-center justify-center">
                <span className="font-bold">Step 2: Uploading new files...</span>
            </div>
        )
    }

    const step3 = () => {
        return(
            <div key={2} className="flex flex-col items-center justify-center">
                <span className="font-bold">Step 3: Press the button below and select the 'RP2350' or 'RP2' folder in the file manager!</span>
                <Button color="primary" onClick={dropUF2} disabled={step != 3}>Select Device</Button>
            </div>
        )
    }

    const step4 = () => {
        return(
            <div key={3} className="flex flex-col items-center justify-center">
                <span className="font-bold">Step 4: Uploading firmware update...</span>
            </div>
        )
    }

    const step5 = () => {
        return(
            <div key={4} className="flex flex-col items-center justify-center">
                <span className="font-bold">Update complete! You can now close this dialog!</span>
            </div>
        )
    }

    const updateScreen = () => {
        let steps = [step1(), step2(), step3(), step4(), step5()];

        steps = steps.slice(0, step);

        return steps;
    }


    return(
        <CustomModal ref={customModalRef} title={"Update " + title()} allowClose={step == 0 || step == 5}>
            {
                step == 0   ?
                    mainScreen()
                            :
                    updateScreen()
            }
        </CustomModal>
    );
});


export default UpdateModal;