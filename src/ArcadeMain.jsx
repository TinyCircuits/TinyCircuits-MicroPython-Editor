import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Arcade from './Arcade'
import './index.css'

createRoot(document.getElementById('root')).render(
  // https://stackoverflow.com/a/71982736
  // <StrictMode>
    <Arcade />
  // </StrictMode>,
)
