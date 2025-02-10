import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button, Modal, Input, Checkbox} from 'react-daisyui'
import CustomModal from './CustomModal';
import FilesPanel from './FilesPanel';


let LocationModal = forwardRef(function LocationModal(props, ref){

    const {platform} = props;

    const customModalRef = useRef(null);
    const [title, setTitle] = useState("");
    const [tree, setTree] = useState(null);
    const [deviceFiles, setDeviceFiles] = useState(undefined);

    const [selectedPath, setSelectedPath] = useState("/");
    const [name, setName] = useState("");
    // const [resolve, setResolve] = useState(null);
    // const [reject, setReject] = useState(null);

    const promiseResolve = useRef(null);

    const complete = (resultPath) => {
        customModalRef.current.close();
        promiseResolve.current(resultPath);
    }

    const getResultPath = () => {
        return (selectedPath == "/" ? "" : selectedPath) + "/" + name;
    }

    const onFolderSelected = (selected) => {
        console.log(selected);
        setSelectedPath(selected);
    }

    useImperativeHandle(ref, () => ({
            showModal(){
                customModalRef.current.showModal();
            },
            close(){
                customModalRef.current.close();
            },
            location(title, name, files, file=true){
                setTitle(title);
                setName(name);

                files.openFiles(setTree).then(() => {
                    setDeviceFiles(files);
                    customModalRef.current.showModal();
                })
                
    
                return new Promise((resolve, reject) => {
                    promiseResolve.current = resolve;
                });
            }
        }), []);


    return(
        <CustomModal title={title} titleColor="base-content" btn="Confirm" onCloseClick={() => {complete(undefined)}} onBtnClick={() => {complete(getResultPath())}} outlineColor="base-content" ref={customModalRef}>
            <div className="w-full h-full bg-base-200">
                <FilesPanel tree={tree} setTree={setTree} showRoot={true} platform={platform} mainFiles={deviceFiles} deviceFiles={deviceFiles} checkmarks={false} showFiles={false} collapsible={false} onFolderSelected={onFolderSelected} allFoldersOpen={true}/>
            </div>
            <div className='w-full h-full flex flex-col items-center justify-centerg'>

                <div className="form-control w-full max-w-xs">
                    <label className="label p-1">
                        <span className="label-text font-bold">Selected:</span>
                    </label>
                    <Input onChange={(event) => setSelectedPath(event.target.value)} value={selectedPath} size='sm' className='w-full'/>
                </div>

                <div className="form-control w-full max-w-xs mb-1">
                    <label className="label p-1">
                        <span className="label-text font-bold">Result:</span>
                    </label>
                    <Input readOnly={true} size='sm' value={getResultPath()} className='w-full'/>
                </div>
            </div>
        </CustomModal>
    );
});


export default LocationModal;