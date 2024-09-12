import { useState } from 'react'
import './tailwind_output.css'
import { Theme, Button } from 'react-daisyui'
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';


function FilesPanel(props){
    const items = {
        root: {
            index: 'root',
            canMove: true,
            isFolder: true,
            children: ['child1', 'child2'],
            data: 'Root item',
            canRename: true,
        },
        child1: {
            index: 'child1',
            canMove: true,
            isFolder: false,
            children: [],
            data: 'Child item 1',
            canRename: true,
        },
        child2: {
            index: 'child2',
            canMove: true,
            isFolder: false,
            children: [],
            data: 'Child item 2',
            canRename: true,
        }
      };
    
    return (
        <div className="w-full h-full flex flex-col">
            <UncontrolledTreeEnvironment
                canDragAndDrop
                canDropOnFolder
                canReorderItem
                dataProvider={new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))}
                getItemTitle={item => item.data}
                viewState={{}}
                >
                    
                <div className="rct-dark" style={{ backgroundColor: '#222', color: '#e3e3e3' }}>
                    <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
                </div>
            </UncontrolledTreeEnvironment>
        </div>
    )
}


export default FilesPanel;