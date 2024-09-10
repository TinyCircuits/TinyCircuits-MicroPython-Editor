import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import './tailwind_output.css'
import { Theme, Button } from 'react-daisyui'

import {
  getPanelElement,
  getPanelGroupElement,
  getResizeHandleElement,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

function App(props) {
  return (
    <div className="w-1/2 h-1/2 bg-red-600">
      {/* <Theme dataTheme="dark">
        <Button color="primary">Click me, dark!</Button>
      </Theme>

      <Theme dataTheme="dark">
        <Button color="accent">Click me, light!</Button>
      </Theme> */}

      <PanelGroup direction="horizontal" id="group">
        <Panel id="left-panel">{<p>Left</p>}</Panel>

        <PanelResizeHandle id="resize-handle" className="w-1 bg-accent"/>
        
        <Panel id="right-panel">{<p>Right</p>}</Panel>
      </PanelGroup>
    </div>
  )
}

export default App
