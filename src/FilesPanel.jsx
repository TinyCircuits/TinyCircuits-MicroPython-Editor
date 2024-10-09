import { useState, useMemo, useRef } from 'react'
import './tailwind_output.css'
import { Theme, Button, Checkbox } from 'react-daisyui'
import { Tree } from 'react-arborist'
import useResizeObserver from 'use-resize-observer'



function FilesPanel(props){

    const { ref, width, height } = useResizeObserver();
    let treeRef = useRef();

    // Converts file tree to structure that react-arborist can use
    const getData = (tree_parent, data_parent, checked, first=false) => {
        tree_parent.forEach(tree_child => {

            // Get the last part of the path for the name
            let path = tree_child.path;
            let split_path = path.split('/');
            let name = split_path[split_path.length-1];

            // Start the entry that will go in the parent child list
            let entry = {id:tree_child.path, name:name, checked:checked};

            // Flag that can be set to check children
            let check_children = checked;

            // If still not checked, see if this node is checked and then
            // check thr entry + check anything else under this folder, if
            // this is a folder
            if(checked == false && path == props.pathCheckedToRun){
                entry.checked = true;

                // IF this is a folder, check the rest of the nodes under this
                if(tree_child.content != undefined){
                    check_children = true;
                }
            }

            // If folder, convert the rest of the elements under it/its children
            if(tree_child.content != undefined){
                entry.children = [];
                getData(tree_child.content, entry.children, check_children, false);
            }

            data_parent.push(entry);
        });

        return data_parent;
    }

    const getRow = (node) => {
        if(node.isLeaf){
            return(
                <div className={"w-full flex flex-row hover:bg-base-200 cursor-pointer items-center flex-nowrap " + (node.data.checked ? "bg-base-300 " : "") + (node.isFocused ? "bg-base-200" : "")}>
                    <div className="flex w-12 w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-fill" viewBox="0 0 16 16">
                            <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/>
                        </svg>
                        <p className='text-nowrap'>{node.data.name}</p>
                    </div>

                    <div className="flex flex-1 w-full">
                        <Checkbox size='sm' className='mx-2' defaultChecked={node.data.checked} color={node.id == props.pathCheckedToRun ? "primary" : ""} disabled={(node.id == props.pathCheckedToRun || props.pathCheckedToRun == "") ? false : true}/>
                    </div>
                </div>
            );
        }else{
            return(
                <div className={"w-full flex flex-row hover:bg-base-200 cursor-pointer items-center flex-nowrap " + (node.data.checked ? "bg-base-300 " : "")}>
                    <div className="flex w-12 w-full">
                        {
                            node.isOpen ?   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                                            </svg>
                                        :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                                            </svg>
                        }
                        <p className='text-nowrap'>{node.data.name}</p>
                    </div>

                    <div className="flex flex-1 w-full">
                        <Checkbox size='sm' className='mx-2' defaultChecked={node.data.checked} color={node.id == props.pathCheckedToRun ? "primary" : ""} disabled={(node.id == props.pathCheckedToRun || props.pathCheckedToRun == "") ? false : true}/>
                    </div>
                </div>
            );
        }
    }

    function Node({ node, style, dragHandle }) {
        /* This node instance can do many things. See the API reference. */
        return (
            <div style={style} ref={dragHandle} onClick={() => node.isInternal && node.toggle()}>
                {getRow(node)}
            </div>
        );
    }


    const handleClick = (mouseEvent) => {
        let node = treeRef.current.focusedNode;

        // If the target is the checkbox, set for run and expand again if folder row.
        // Otherwise, if a file and target is not a checkbox, open the file in a new editor
        if(mouseEvent.target.nodeName == "INPUT"){
            // Node ids are the absolute file paths
            let pathToRun = node.id;
            if(mouseEvent.target.checked){
                props.setPathCheckedToRun(pathToRun);
            }else{
                props.setPathCheckedToRun("");
            }

            if(node.children != null) node.open();
        }else if(node.children == null){
            // Only open a code editor if actually selected something and is not a folder
            if(node.isLeaf){
                props.addCodeEditor(node.id, node.data.name);
            }
        }
    }

    
    return (
        <div className='w-full h-full' ref={ref}>
            <Tree ref={treeRef} data={getData(props.tree, [], false, true)} height={height} width={width}
                  onClick={handleClick}>
                {Node}
            </Tree>
        </div>
    );
}


export default FilesPanel;