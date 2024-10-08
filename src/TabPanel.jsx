import { useState } from 'react'
import './tailwind_output.css'
import { Theme, Button, Tabs as DaisyTabs} from 'react-daisyui'
import Tabs, { Tab } from '@uiw/react-tabs-draggable';


// https://github.com/uiwjs/react-tabs-draggable?tab=readme-ov-file#add--close-tab
// Used to adjust tabs array before re-render of tabs
function insertAndShift(arr, from, to) {
    let cutOut  = arr.splice(from, 1)[0];
    arr.splice(to, 0, cutOut );
    return arr;
}



// {
//     <DaisyTabs variant='bordered'>
//         {
//             tabsData.map(
//                 (m, idx) => {
//                     return (
//                         <Tab key={idx} id={m.id} className="">
//                             <DaisyTabs.Tab active={true}>
//                                 {/* {m.children} */}
//                                 {/* <button onClick={(evn) => whenTabClosed(m, evn)}>x</button> */}
//                             </DaisyTabs.Tab>
//                         </Tab>
//                     );
//                 }
//             )
//         }
//     </DaisyTabs>
    
// }



function TabPanel(props){

    const {tabsData, setTabsData, draggable, closeable, ...other_props} = props;

    // const [tabsData, setTabsData] = useState(tabs);

    // The active tab key
    const [activeKey, setActiveKey] = useState(0);

    // When a tab is clicked, set the active key which
    // will index into editor component array and render
    // a different editor
    const whenTabClicked = (id, evn) => {
        evn.stopPropagation();
        setActiveKey(id);
    };

    // When a tab is closed, find the index of the tab
    // using ID, set the active key to some other tab,
    // and filter out the array so that tabs disappears
    // adn close the editor
    const whenTabClosed = (item, evn) => {
        evn.stopPropagation();
        const idx = props.tabsData.findIndex((m) => m.id === item.id);

        let active = -1;
        if(idx > -1 && activeKey){
            active = props.tabsData[idx - 1] ? props.tabsData[idx - 1].id : props.tabsData[idx].id;
            setActiveKey(active || -1);
        }

        setTabsData(props.tabsData.filter((m) => m.id !== item.id));
    };

    // When a tab is dropped, reorganize all the tabs
    const whenTabDropped = (id, index) => {
        const oldIndex = [...props.tabsData].findIndex((m) => m.id === id);
        const newData = insertAndShift([...props.tabsData], oldIndex, index);
        setTabsData(newData);
    };

    const getActiveComponent = () => {
        let tabData = props.tabsData.find((entry) => entry.id == activeKey);

        if(tabData == undefined){
            return <></>;
        }

        return tabData.children.component;
    }

    const addCloseButton = (m) => {
        if(closeable){
            return <button style={{all:'unset', width:18}} onClick={(evn) => whenTabClosed(m, evn)} className='btn'>x</button>
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full bg-error relative">
                <Tabs activeKey={activeKey} style={{ gap: 1, overflow: 'auto' }} role="tablist" className="tabs tabs-bordered bg-base-200" onTabClick={(id, evn) => whenTabClicked(id, evn)} onTabDrop={(id, index) => whenTabDropped(id, index)}>
                    {
                        props.tabsData.map(
                            (m, idx) => {
                                return (
                                    <Tab key={idx} id={m.id} role="tab" className={"tab" + " " + (m.id==activeKey ? "tab-active" : "")} draggable={draggable}>
                                        <div className='flex'>
                                            {m.children.title}
                                            {addCloseButton(m)}
                                        </div>
                                    </Tab>
                                );
                            }
                        )
                    }
                </Tabs>
            </div>

            <div className="w-full h-full min-h-0 overflow-hidden relative">
                {
                    props.tabsData.map((item, index) => {
                        return (
                            <div key={index} className={"top-0 left-0 right-0 bottom-0 min-h-0 absolute" + " " + (item.id==activeKey ? "z-10" : "invisible z-0")}>
                                {item.children.component};
                            </div>
                        );
                    })
                }
            </div>

        </div>
    )
}


export default TabPanel;