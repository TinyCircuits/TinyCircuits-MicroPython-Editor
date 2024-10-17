import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Submit from './Submit'
import './index.css'

createRoot(document.getElementById('root')).render(
  // https://stackoverflow.com/a/71982736
  // <StrictMode>
    <Submit />
  // </StrictMode>,
)
