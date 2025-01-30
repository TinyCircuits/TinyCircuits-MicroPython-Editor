import CustomModal from "./CustomModal";
import { Platform } from "../App";
import { forwardRef, useRef, useImperativeHandle, useState, useEffect } from "react";
import { Select, Button } from "react-daisyui";


let UpdateModal = forwardRef(function UpdateModal(props, ref){
    const {platform, detectedDeviceVersion={detectedDeviceVersion}} = props;
    const customModalRef = useRef(null);
    const [versions, setVersions] = useState([]);   // Consists of [{"date":, "path":, "changelog":}, ...]
    const [selectedVersion, setSelectedVersion] = useState({"date":"", "path":"", "changelog":""});

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

    useEffect(() => {
        setupVersions();
    }, []);

    return(
        <CustomModal ref={customModalRef} title={"Update " + title()}>
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
                    <Button color="primary">Update</Button>
                </div>

                <div className="w-full flex-1 text-sm">
                    <span><b>NOTE:</b> this will delete and update the <b>/main.py</b> file and <b>/system</b> folder but will not affect any other files or folders</span>
                </div>
            </div>

            

            
        </CustomModal>
    );
});


export default UpdateModal;