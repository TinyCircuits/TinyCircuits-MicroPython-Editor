import { createRoot } from 'react-dom/client';

// Sets up root for React DOM
export default function setupRoot(component){
    // Start access to the DOM in here to reduce number of main files needed
    if(window.reactRoot == undefined){
        window.reactRoot = createRoot(document.getElementById('root'));
    }

    window.reactRoot.render(component);
}