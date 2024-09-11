import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import './tailwind_output.css'
import { Theme, Button } from 'react-daisyui'
import PageHeader from './PageHeader.jsx'

import {
  getPanelElement,
  getPanelGroupElement,
  getResizeHandleElement,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

function App(props){
  return(
    <div className="w-full h-full bg-base-300 flex flex-col">
      <PageHeader>

      </PageHeader>

        
      <PanelGroup direction="horizontal">
        <Panel className="bg-base-100" defaultSize={15}>{<p>Left</p>}</Panel>

        <PanelResizeHandle className="w-1 bg-base-300"/>

        <Panel>
          <PanelGroup direction="vertical">
            <Panel className="bg-base-100">{<p>Top</p>}</Panel>
            <PanelResizeHandle className="h-1 bg-base-300"/>
            <Panel className="bg-base-100" defaultSize={30}>{<p>Bottom</p>}</Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 bg-base-300"/>
        
        <Panel className="bg-base-100" defaultSize={15}>{<p>Right</p>}</Panel>
      </PanelGroup>

    </div>
  )
}

export default App
