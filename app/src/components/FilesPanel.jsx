import { useRef, useEffect, useState } from 'react'
import { Button, Checkbox } from 'react-daisyui'
import { Tree } from 'react-arborist'
import useResizeObserver from 'use-resize-observer'
import { Platform } from '../App';
import InputModal from './InputModal';
import LocationModal from './LocationModal'
import ErrorModal from './ErrorModal';
import ConfirmModal from './ConfirmModal';


function FilesPanel(props){

    const { ref, width, height } = useResizeObserver();
    let treeRef = useRef();
    let inputModalRef = useRef(undefined);
    let locationModalRef = useRef(undefined);
    let errorModalRef = useRef(undefined);
    let confirmModalRef = useRef(undefined);

    // Converts file tree to structure that react-arborist can use
    const getData = (tree_parent, data_parent, checked) => {
        let folders = [];
        let mainFiles = [];

        if(tree_parent == undefined){
            return data_parent;
        }

        tree_parent.forEach(tree_child => {
            // Get the last part of the path for the name
            let path = tree_child.path;
            
            let name = undefined;

            if(path == "/"){
                name = "/";
            }else{
                let split_path = path.split('/');
                name = split_path[split_path.length-1];
            }

            // Start the entry that will go in the parent child list
            let entry = {id:tree_child.path, name:name, checked:checked};

            // Flag that can be set to check children
            let check_children = checked;

            if(props.checkmarks == true || props.checkmarks == undefined){
                // If still not checked, see if this node is checked and then
                // check thr entry + check anything else under this folder, if
                // this is a folder
                if(checked == false && path == props.pathCheckedToRun.path){
                    entry.checked = true;

                    // If this is a folder, check the rest of the nodes under this
                    if(tree_child.content != undefined){
                        check_children = true;
                    }
                }

                if(entry.checked || checked){
                    props.allCheckedPaths.push({path:path, isFolder:tree_child.content != undefined});
                }
            }

            // If folder, convert the rest of the elements under it/its children
            if(tree_child.content != undefined){
                entry.children = [];
                getData(tree_child.content, entry.children, check_children, false);
            }

            if((tree_child.content == undefined && (props.showFiles == true || props.showFiles == undefined)) || tree_child.content != undefined){
                if(tree_child.content != undefined){
                    folders.push(entry);
                }else{
                    mainFiles.push(entry);
                }
            }
        });

        data_parent.push(...folders);
        data_parent.push(...mainFiles);

        return data_parent;
    }

    const getRow = (node) => {
        if(node.isLeaf){
            return(
                <div className={"relative w-full hover:bg-base-300 cursor-pointer items-center flex-nowrap " + (node.data.checked ? "bg-base-300 " : "") + (node.isFocused ? "bg-base-300" : "")}>
                    <div className="flex w-full items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="min-w-[16px] min-h-[16px] bi bi-file-earmark-fill" viewBox="0 0 16 16">
                            <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/>
                        </svg>
                        <p className='text-nowrap'>{node.data.name}</p>
                    </div>

                    {
                        (props.checkmarks == true || props.checkmarks == undefined) ? 
                        <div className={"flex flex-1 absolute right-0 top-0 bottom-0 items-center z-[10000] hover:bg-base-300 " + ((node.data.checked) ? "bg-base-300 " : "bg-base-100")}>
                            <Checkbox size='sm' className='mx-1' defaultChecked={node.data.checked} color={node.id == props.pathCheckedToRun.path ? "primary" : ""} disabled={(node.id == props.pathCheckedToRun.path || props.pathCheckedToRun.path == "") ? false : true}/>
                        </div>
                                                                                    :
                        <></>
                    }
                </div>
            );
        }else{
            return(
                <div className={"relative w-full hover:bg-base-300 cursor-pointer items-center flex-nowrap " + (node.data.checked ? "bg-base-300 " : "")}>
                    <div className="flex w-full items-center">
                        {
                            node.isOpen ?   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="min-w-[16px] min-h-[16px] bi bi-chevron-down" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                            </svg>
                                        :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="min-w-[16px] min-h-[16px] bi bi-chevron-right" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                                            </svg>
                        }
                        <p className='text-nowrap'>{node.data.name}</p>
                    </div>

                    {
                        (props.checkmarks == true || props.checkmarks == undefined) ? 
                        <div className={"flex flex-1 absolute right-0 top-0 bottom-0 items-center z-[10000] hover:bg-base-300 " + (node.data.checked ? "bg-base-300 " : "bg-base-100")}>
                            <Checkbox size='sm' className='mx-1' defaultChecked={node.data.checked} color={node.id == props.pathCheckedToRun.path ? "primary" : ""} disabled={(node.id == props.pathCheckedToRun.path || props.pathCheckedToRun.path == "") ? false : true}/>
                        </div>
                                                                                    :
                        <></>
                    }
                </div>
            );
        }
    }


    function Node({ node, style, dragHandle }){
        const [dropdownOpen, setDropdownOpen] = useState(false);

        const handleDropdown = (event) => {
            event.preventDefault();
            setDropdownOpen(!dropdownOpen);
        }

        // Get files from device and download to computer
        const downloadClick = async (node, path) => {
            // Tests if a file or directory inside a computer
            // directory already exists
            const doesAlreadyExist = async (isFile, dirHandle, name) => {
                if(isFile){
                    try{
                        await dirHandle.getFileHandle(name);
                        return true;
                    }catch{
                        return false;
                    }
                }else{
                    try{
                        await dirHandle.getDirectoryHandle(name);
                        return true;
                    }catch{
                        return false;
                    }
                }
            }

            // Provided dir handle where file where live, download a file
            // from the device into the given name from the given path
            const downloadFile = async (dirHandle, path, name) => {
                const fileHandle = await dirHandle.getFileHandle(name, {create:true});
                const fileData = await props.deviceFiles.openFile(path);

                // Create a FileSystemWritableFileStream to write to.
                const writable = await fileHandle.createWritable();

                // Write the contents of the file to the stream.
                await writable.write(fileData);

                // Close the file and write the contents to disk.
                await writable.close();
            }

            // Recursively traverses file tree from device and returns file count
            const getFileCount = (children) => {
                let count = 0;

                if(children == undefined){
                    return 1;
                }

                for(let i=0; i<children.length; i++){
                    const child = children[i];

                    if(child.children != undefined){
                        count += getFileCount(child.children);
                    }else{
                        if(child.id.indexOf(".ini") != -1){
                            errorModalRef.current.show("Cannot interact with .ini file at path `" + child.id + "` please change its extension!");
                            throw new Error("FilesPanel: Cannot interact with .ini file at path `" + child.id + "` please change its extension!");
                        }
                        count++;
                    }
                }

                return count;
            }

            const data = node.data;
            const fileCount = getFileCount(data.children);
            let downloadedFileCount = 0;

            // Recursively traverses file tree from device and re-creates tree on
            // computer, as well as downloads all files from the device at the same
            // time
            const recurseDownload = async (parentHandle, children) => {
                for(let i=0; i<children.length; i++){
                    const child = children[i];

                    if(child.children != undefined){
                        const dirHandle = await parentHandle.getDirectoryHandle(child.name, {create:true});
                        await recurseDownload(dirHandle, child.children);
                    }else{
                        await downloadFile(parentHandle, child.id, child.name);
                        downloadedFileCount++;
                        window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: downloadedFileCount/fileCount}}));
                    }
                }
            }

            // Get the name of element to be downloaded from the device
            // and a handle on the computer to download it to
            const name = path.split("/").pop();
            const downloadToDirHandle = await window.showDirectoryPicker();

            if(await doesAlreadyExist(node.isLeaf, downloadToDirHandle, name)){
                if(!(await confirmModalRef.current.request("`" +name + "` already exists? Do you want to overwrite it?", "Yes", "No"))){
                    return;
                }
            }

            // If file, download that to computer now and stop
            if(node.isLeaf){
                await downloadFile(downloadToDirHandle, path, name);
                window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: 0.85}}));
                window.dispatchEvent(new CustomEvent("end_progress"));
                return;
            }

            // Must have been a directory, download the full
            // tree to the computer
            const dirHandle = await downloadToDirHandle.getDirectoryHandle(name, {create:true});
            await recurseDownload(dirHandle, data.children);
            window.dispatchEvent(new CustomEvent("end_progress"));
        }

        // Get files from computer and download to device
        const uploadClick = async (path) => {
            const name = path.split("/").pop();
            console.log("Upload:", path, name);
            await props.deviceFiles.openFiles();

            // Get full path to the folder or file on device to upload file or folder to
            const location = await locationModalRef.current.location("Select Where to Upload '" + name + "':", name, props.deviceFiles, false);
            
            // Get the file system handle for the file or folder
            const [foundName, foundHandle, foundParentHandle] = await props.computerFiles.find(path, "", props.computerFiles.dir_handle);

            if(foundHandle.kind == "directory"){
                const getFileCount = async (parentHandle) => {
                    let count = 0;

                    for await (const [name, handle] of parentHandle.entries()){
                        if(handle.kind == "directory"){
                            count += await recurseUpload(handle, path + "/" + name);
                        }else if(handle.kind == "file"){
                            count++;
                        }
                    }

                    return count;
                }

                const fileCount = await getFileCount(foundHandle);
                let downloadedFileCount = 0;

                const recurseUpload = async (parentHandle, path) => {
                    for await (const [name, handle] of parentHandle.entries()){
                        if(handle.kind == "directory"){
                            await recurseUpload(handle, path + "/" + name);
                        }else if(handle.kind == "file"){
                            const file = await handle.getFile();
                            const data = await file.arrayBuffer();

                            console.warn(path, path + "/" + name);

                            await props.deviceFiles.newFolder(path);
                            await props.deviceFiles.saveFile(path + "/" + name, data);

                            downloadedFileCount++;
                            window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: downloadedFileCount/fileCount}}));
                        }
                    }
                }

                await recurseUpload(foundHandle, location);
                window.dispatchEvent(new CustomEvent("end_progress"));
            }else if(foundHandle.kind == "file"){
                window.dispatchEvent(new CustomEvent("set_progress", {detail: {progress: 0.85}}));
                const file = await foundHandle.getFile();
                const data = await file.arrayBuffer();
                await props.deviceFiles.saveFile(location, data);
                window.dispatchEvent(new CustomEvent("end_progress"));
            }
        }

        const newFile = async (path) => {
            const name = await inputModalRef.current.ask("New File Name", "Type file name:", "Confirm", "script.py");
            await props.mainFiles.newFile(path, name);
            await props.mainFiles.openFiles(props.setTree, true);
        }

        const newFolder = async (path) => {
            const name = await inputModalRef.current.ask("New Folder Name", "Type folder name:", "Confirm", "New Folder");
            await props.mainFiles.newFolder(path, name);
            await props.mainFiles.openFiles(props.setTree, true);
        }

        const renameClick = async (path) => {
            console.log("Rename:", path);
            const newName = await inputModalRef.current.ask("Rename", "Type a new name:", "Rename", path.split("/").pop());

            let oldPath = path;
            let newPath = path.split("/");
            newPath.pop();
            newPath.push(newName);
            newPath = newPath.join("/");

            console.log("Rename:", oldPath, newPath);

            await props.mainFiles.rename(oldPath, newPath);
            await props.mainFiles.openFiles(props.setTree, true);
        }

        const deleteClick = async (path) => {
            console.log("Delete:", path);
            await props.mainFiles.delete(path);
            await props.mainFiles.openFiles(props.setTree, true);
        }

        useEffect(() => {
            const handleMouseDown = (event) => {
                const id = event.target.id;

                if(node.id + ":download_btn" == id){
                    downloadClick(node, node.id);
                }else if(node.id + ":upload_btn" == id){
                    uploadClick(node.id);
                }else if(node.id + ":newfile_btn" == id){
                    newFile(node.id);
                }else if(node.id + ":newfolder_btn" == id){
                    newFolder(node.id);
                }else if(node.id + ":rename_btn" == id){
                    renameClick(node.id);
                }else if(node.id + ":delete_btn" == id){
                    deleteClick(node.id);
                }

                setDropdownOpen(false);
            }

            document.addEventListener("mousedown", handleMouseDown);

            // Cleanup
            return () => {
                document.removeEventListener("mousedown", handleMouseDown);
            };
        }, [])

        /* This node instance can do many things. See the API reference. */
        return (
            <div className='relative' style={style} ref={dragHandle} onClick={() => node.isInternal && node.toggle()} onContextMenu={handleDropdown}>
                {getRow(node)}
                <div className={'absolute w-fit h-fit flex flex-col z-[100000] bg-base-200 ' + (dropdownOpen ? "visible" : "invisible")}>
                    <Button id={node.id + ":download_btn"}  size="sm" fullWidth={true} className='rounded-none' disabled={props.isSerialConnected == false || props.platform == Platform.COMPUTER}>Download to Computer</Button>
                    <Button id={node.id + ":upload_btn"}    size="sm" fullWidth={true} className='rounded-none' disabled={props.isSerialConnected == false || props.platform == Platform.THUMBY || props.platform == Platform.THUMBY_COLOR}>Upload to device</Button>
                    <Button id={node.id + ":newfile_btn"}   size="sm" fullWidth={true} className='rounded-none' disabled={node.isLeaf || props.platform == Platform.NONE}>New File</Button>
                    <Button id={node.id + ":newfolder_btn"} size="sm" fullWidth={true} className='rounded-none' disabled={node.isLeaf || props.platform == Platform.NONE}>New Folder</Button>
                    <Button id={node.id + ":rename_btn"}    size="sm" fullWidth={true} className='rounded-none' disabled={node.id == "/"}>Rename</Button>
                    <Button id={node.id + ":delete_btn"}    size="sm" fullWidth={true} className='rounded-none' disabled={node.id == "/"} color='error'>Delete</Button>
                </div>
            </div>
        );
    }


    const handleClick = (mouseEvent) => {
        let node = treeRef.current.focusedNode;

        if(node == null){
            return;
        }

        let isNodeFolder = node.children != null;

        if(isNodeFolder && props.collapsible == false){
            node.open();

            // Call selected folder callback and pass the path to the folder
            if(props.onFolderSelected != undefined) props.onFolderSelected(node.id);
        }

        // If the target is the checkbox, set for run and expand again if folder row.
        // Otherwise, if a file and target is not a checkbox, open the file in a new editor
        if(mouseEvent.target.nodeName == "INPUT"){
            // Node ids are the absolute file paths
            let pathToRun = node.id;
            if(mouseEvent.target.checked){
                props.setPathCheckedToRun({path:pathToRun, isFolder:isNodeFolder});
            }else{
                props.setPathCheckedToRun({path:"", isFolder:false});
            }

            if(isNodeFolder) node.open();
        }else if(isNodeFolder == false){
            // Only open a code editor if actually selected something and is not a folder
            if(node.isLeaf){
                props.addCodeEditor(node.id, node.data.name);
            }
        }
    }


    // Only once (that's what the empty list is for) style the inner tree
    // element to have a thin and stable scrollbar
    useEffect(() => {
        treeRef.current.list.current._outerRef.style.setProperty("scrollbar-gutter", "stable");
        treeRef.current.list.current._outerRef.style.setProperty("scrollbar-width", "thin");
    }, []);

    // Update tree when prop changes
    useEffect(() => {
        if(props.allFoldersOpen){
            treeRef.current.openAll();
        }else{
            treeRef.current.closeAll();
        }
    }, [props.allFoldersOpen]);

    useEffect(() => {
        if(treeRef.current.firstNode != null){
            treeRef.current.firstNode.open();
        }
    }, [props.tree]);
    
    return (
        <div className='w-full h-full' ref={ref}>
            <InputModal ref={inputModalRef}/>
            <LocationModal ref={locationModalRef} platform={Platform.THUMBY_COLOR}/>
            <ErrorModal ref={errorModalRef}/>
            <ConfirmModal ref={confirmModalRef}/>

            <Tree ref={treeRef} data={getData(props.tree, [], false)} height={height} width={width} onClick={handleClick} openByDefault={false}>
                {Node}
            </Tree>
        </div>
    );
}


export default FilesPanel;