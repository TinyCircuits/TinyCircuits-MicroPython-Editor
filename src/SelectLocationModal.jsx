import { useRef, useEffect, useState } from 'react';
import { Button, Modal, Input, Checkbox} from 'react-daisyui'
import FilesPanel from './FilesPanel';


function SelectLocationModal(props){
    const {pathCheckedToRun, runAfterLocationSelect, setRunAfterLocationSelect, runLocationSelectTree} = props;

    const modalRef = useRef(null);
    const [selectedPath, setSelectedPath] = useState("/");
    const [createRUNFolderChecked, setCreateRUNFolderChecked] = useState(false);

    useEffect(() => {
        if(runAfterLocationSelect != undefined){
            console.log(runLocationSelectTree);
            modalRef.current.showModal();
        }
    });

    const onFolderSelected = (selected) => {
        console.log(selected);
        setSelectedPath(selected);
    }

    const onSelectedPathInputChange = (event) => {
        setSelectedPath(event.target.value);
    }

    const getResultingRUNPath = () => {
        // Get the name of the file or folder
        let name = pathCheckedToRun.path.substring(pathCheckedToRun.path.lastIndexOf("/")+1);

        if(pathCheckedToRun.isFolder && createRUNFolderChecked == true){
            if(selectedPath[selectedPath.length-1] == '/'){
                return selectedPath + name;
            }else{
                return selectedPath + "/" + name;
            }
        }else{
            return selectedPath;
        }
    }

    const onRUN = (event) => {
        setRunAfterLocationSelect(undefined);
        runAfterLocationSelect(getResultingRUNPath());
    }

    return(
        <Modal ref={modalRef}>
            <Modal.Header className="font-bold">Select RUN Location Folder:</Modal.Header>
            <Modal.Body>
                <div className="w-full h-full bg-base-200">
                    <FilesPanel tree={runLocationSelectTree} showRoot={true} checkmarks={false} showFiles={false} collapsible={false} onFolderSelected={onFolderSelected}/>
                </div>
                <div className="h-8 flex items-center mt-2">
                    <p className="text-nowrap font-bold">Selected RUN Path:</p>
                    <Input onChange={onSelectedPathInputChange} value={selectedPath} size='sm' className='ml-2 w-full' />
                </div>
                <div className="h-8 flex items-center mt-2">
                    <p className="text-nowrap font-bold">Create RUN folder:</p>
                    <Checkbox disabled={pathCheckedToRun.isFolder == false} onChange={(event) => setCreateRUNFolderChecked(event.target.checked)} checked={createRUNFolderChecked} size='sm' className='ml-2'/>
                </div>
                <div className="h-8 flex items-center mt-2">
                    <p className="text-nowrap font-bold">Resulting RUN Path:</p>
                    <Input readOnly={true} value={getResultingRUNPath()} size='sm' className='ml-2 w-full' />
                </div>
                <p className='mt-4 text-sm'>WARNING: Files/folders selected to RUN will be uploaded to the resulting RUN location which can result in files/folders being overwritten</p>
            </Modal.Body>

            <Modal.Actions>
                <form method="dialog">
                    <Button color='success' onClick={onRUN}>RUN</Button>
                </form>
                <form method="dialog">
                    <Button onClick={() => {setRunAfterLocationSelect(undefined)}}>Cancel</Button>
                </form>
            </Modal.Actions>
        </Modal>
    );
}


export default SelectLocationModal;