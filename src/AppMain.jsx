// window.addEventListener = (type, listener) => {};
// const defaultAddEventListener = EventTarget.prototype.addEventListener;



import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  // https://stackoverflow.com/a/71982736
  // <StrictMode>
    <App />
  // </StrictMode>,
)
