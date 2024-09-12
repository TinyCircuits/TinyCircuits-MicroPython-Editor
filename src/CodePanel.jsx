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



function CodePanel(props){
    // The tabs data that gives each tab a name
    const [tabsData, setTabsData] = useState([
        { id: 0, children: {title:'Google', component:<>Google Component</>} },
        { id: 1, children: {title:'MicroSoft', component:<>MicroSoft Component</>}},
        { id: 2, children: {title:'Baidu', component:<>Baidu Component</>}},
        { id: 3, children: {title:'Taobao', component:<>Taobao Component</>}},
        { id: 4, children: {title:'JD', component:<>JD Component</>}},
        { id: 5, children: {title:'Apple', component:<>Apple Component</>}},
        { id: 6, children: {title:'Bing', component:<>Bing Component</>}},
        { id: 7, children: {title:'Gmail', component:<>Gmail Component</>}},
        { id: 8, children: {title:'Gitter', component:<>Gitter Component</>}},
    ]);

    // The active tab key
    const [activeKey, setActiveKey] = useState(-1);

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
        const idx = tabsData.findIndex((m) => m.id === item.id);

        let active = -1;
        if(idx > -1 && activeKey){
            active = tabsData[idx - 1] ? tabsData[idx - 1].id : tabsData[idx].id;
            setActiveKey(active || -1);
        }

        setTabsData(tabsData.filter((m) => m.id !== item.id));

        // TODO: close code editor and maybe remove it from an array!
    };

    // Copy tab data and add one more tab item and then
    // set the tabs data for persistance and to re-render
    // component using a `useState` set function
    const whenTabAdded = () => {
        // const newData = [...tabsData, { id: tabsData.length+1}`, children: `New Tab ${tabsData.length+1}` }];
        // setTabsData(newData);
    };

    // When a tab is dropped, reorganize all the tabs
    const whenTabDropped = (id, index) => {
        const oldIndex = [...tabsData].findIndex((m) => m.id === id);
        const newData = insertAndShift([...tabsData], oldIndex, index);
        setTabsData(newData);
    };


    const getActiveComponent = () => {
        let tabData = tabsData.find((entry) => entry.id == activeKey);

        if(tabData == undefined){
            return <></>;
        }

        return tabData.children.component;
    }


    return (
        <div className="w-full h-full flex flex-col">
            
            <Tabs activeKey={activeKey} style={{ gap: 1, overflow: 'auto' }} role="tablist" className="tabs tabs-bordered" onTabClick={(id, evn) => whenTabClicked(id, evn)} onTabDrop={(id, index) => whenTabDropped(id, index)}>
                {
                    tabsData.map(
                        (m, idx) => {
                            return (
                                <Tab key={idx} id={m.id} role="tab" className={"tab" + " " + (m.id==activeKey ? "tab-active" : "")}>
                                    <div className='flex'>
                                        {m.children.title}
                                        <button style={{all:'unset', width:18}} onClick={(evn) => whenTabClosed(m, evn)} className='btn'>x</button>
                                    </div>
                                </Tab>
                            );
                        }
                    )
                }
            </Tabs>

            <div className="w-full h-full flex flex-col bg-base-200">
                {getActiveComponent()}
            </div>

        </div>
    )
}


export default CodePanel;