import { useState, useMemo } from 'react'
import './tailwind_output.css'
import { Theme, Button } from 'react-daisyui'
import { Tree } from 'react-arborist'
import useResizeObserver from 'use-resize-observer'


function FilesPanel(props){

    const { ref, width, height } = useResizeObserver();

    const getRow = (node) => {
        if(node.isLeaf){
            return(
                <div className={"w-full flex flex-row hover:bg-base-200 cursor-pointer items-center flex-nowrap " + (node.isFocused ? "bg-base-200" : "")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-fill" viewBox="0 0 16 16">
                        <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/>
                    </svg>
                    <p className='text-nowrap'>{node.data.name}</p>
                </div>
            );
        }else{
            return(
                <div className={"w-full flex flex-row hover:bg-base-200 cursor-pointer items-center flex-nowrap"}>
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


    const getData = (tree_parent, data_parent, first=false) => {
        tree_parent.forEach(tree_child => {

            // Get the last part of the path for the name
            let path = tree_child.path;
            let split_path = path.split('/');
            let name = split_path[split_path.length-1];

            if(tree_child.content != undefined){
                let children = [];
                data_parent.push({id:tree_child.path, name:name, children:children});
                getData(tree_child.content, children, false);
            }else{
                data_parent.push({id:tree_child.path, name:name});
            }
        });

        return data_parent;
    }

    const onSelected = (node) => {
        // Only open a code editor if actually selected something and is not a folder
        if(node.length != 0 && node[0].isLeaf){
            props.addCodeEditor(node[0].id, node[0].data.name);
        }
    }
    
    return (
        <div className='w-full h-full' ref={ref}>
            <Tree data={getData(props.tree, [], true)} height={height} width={width}
                  onSelect={onSelected}>
                {Node}
            </Tree>
        </div>
    );
}


export default FilesPanel;