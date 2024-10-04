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
            children: ['child1'],
            data: 'Root item',
            canRename: true,
        },
        child1: {
            index: 'child1',
            canMove: true,
            isFolder: true,
            children: ['child2', 'child3'],
            data: "test",
            canRename: true,
        },
        child2: {
            index: 'child2',
            canMove: true,
            isFolder: false,
            children: [],
            data: 'main.py',
            canRename: true,
        },
        child3: {
            index: 'child3',
            canMove: true,
            isFolder: false,
            children: [],
            data: 'test.py',
            canRename: true,
        }
    };


    const getChevron = (isExpanded) => {
        if(isExpanded){
            return (
                <svg strokeWidth={"10px"} xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                </svg>
            );
        }else{
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                </svg>
            );
        }
    }


    const getIcon = (item, context) => {
        if(item.isFolder){
            return (
                <span {...context.arrowProps} className="flex items-center">
                    {getChevron(context.isExpanded)}
                    {
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mx-1 bi bi-folder-fill" viewBox="0 0 16 16">
                            <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                        </svg>
                    }
                </span>
            );
        }else{
            return (
                <span {...context.arrowProps} className="flex items-center">
                    {
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mx-1 bi bi-file-fill" viewBox="0 0 16 16">
                            <path fillRule='evenodd' d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2"/>
                        </svg>
                    }
                </span>
            );
        }
    }


    return (
        <UncontrolledTreeEnvironment

            defaultInteractionMode={{
                mode: 'custom',
                extends: 'click-item-to-expand',
                createInteractiveElementProps: (item, treeId, actions, renderFlags) => ({
                    // https://rct.lukasbach.com/docs/guides/interaction-modes/#:~:text=to%20extend%20with-,the%20extend%20prop,-%3A
                    onDoubleClick: e => {
                        console.log(e, item);
                    },
                }),
            }}
            canDragAndDrop={false}
            canDropOnFolder={false}
            canReorderItems={false}
            dataProvider={new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))}
            getItemTitle={item => item.data}
            viewState={{
                ['tree-1']: {
                expandedItems: ['container'],
                },
            }}
            renderItemTitle={({ title }) => <span>{title}</span>}

            renderItemArrow={({ item, context }) => {
                    
                    return (
                        (getIcon(item, context))
                    );
                
                }
            }

            renderItem={({ title, arrow, depth, context, children }) => {
                const InteractiveComponent = context.isRenaming ? 'div' : 'button';
                return (
                    <li
                        {...context.itemContainerWithChildrenProps}
                        style={{
                            margin: 0,
                            marginLeft: depth*25 + "px",
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}
                    >
                        < InteractiveComponent {...context.itemContainerWithoutChildrenProps} {...context.interactiveElementProps} className='flex items-center text-sm h-8 bg-base-100' style={{borderRadius:"0px"}}>
                            {arrow}
                            {title}
                        </InteractiveComponent>
                        {children}
                    </li>
                );
            }}
                renderTreeContainer={({ children, containerProps }) => <div {...containerProps}>{children}</div>}
                renderItemsContainer={({ children, containerProps }) => <ul {...containerProps}>{children}</ul>}
            >

            <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
        </UncontrolledTreeEnvironment>
    );
}


export default FilesPanel;