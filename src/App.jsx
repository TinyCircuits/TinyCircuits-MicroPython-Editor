import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import './tailwind_output.css'
import { Theme, Button } from 'react-daisyui'
import PageHeader from './PageHeader.jsx'
import PageFooter from './PageFooter.jsx'
import PanelHeader from './PanelHeader.jsx'
import FilesConnection from './files_connection.js'
import FilesPanel from './FilesPanel.jsx'
import CodePanel from './CodePanel.jsx'

import {
  getPanelElement,
  getPanelGroupElement,
  getResizeHandleElement,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

function App(props){
  // Create instance of class that handles files opened on computer
  const files_connection = new FilesConnection();

  return(
    <div className="w-full h-full bg-base-300 flex flex-col">
      <PageHeader files_connection={files_connection}>

      </PageHeader>

        
      <PanelGroup direction="horizontal">
        {/* <Panel className="bg-base-100" defaultSize={15} minSize={2} maxSize={98}>
          <PanelHeader title="Computer Files"/>
          <FilesPanel />
        </Panel>

        <PanelResizeHandle className="w-1 bg-base-300"/> */}

        <Panel>
          <PanelGroup direction="vertical">
            <Panel className="bg-base-100" minSize={2} maxSize={98}>
              {/* <PanelHeader title="Code"/> */}
              <CodePanel />
            </Panel>

            <PanelResizeHandle className="h-1 bg-base-300"/>

            <Panel className="bg-base-100" defaultSize={25} minSize={2} maxSize={98}>
              <PanelHeader title="Terminal"/>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      <PageFooter>

      </PageFooter>

    </div>
  )
}

export default App
