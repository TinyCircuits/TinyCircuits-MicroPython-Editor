# TinyCircuits-MicroPython-Editor
Web IDE focused on editing, running, and uploading MicroPython code on and to TinyCircuits' devices.

# Libraries
* Framework: [ReactJS](https://react.dev/)
* Editor: [CodeMirror](https://codemirror.net/) + [ReactJS](https://react.dev/) = [React CodeMirror](https://uiwjs.github.io/react-codemirror/)
* Tabs: [react-tabs-draggable](https://github.com/uiwjs/react-tabs-draggable)
* File Tree: [react-arborist](https://github.com/brimdata/react-arborist)
* Terminal: [xterm.js](https://github.com/xtermjs/xterm.js) + [ReactJS](https://react.dev/) = [xterm-react](https://github.com/PabloLION/xterm-react)
* Communication: [ViperIDE](https://github.com/vshymanskyy/ViperIDE/blob/main/src/transports.js)
* Simulator: [MicroPython](https://github.com/micropython/micropython)
* Style: [tailwindcss](https://github.com/tailwindlabs/tailwindcss) + [daisyUI](https://github.com/saadeghi/daisyui) + [ReactJS](https://react.dev/) = [ReactJS daisyUI](https://react.daisyui.com/?path=/docs/welcome--docs)
* Layout: [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
* Backend: [pocketbase](https://pocketbase.io/) (maybe)


# Resources
* Learning react:
    * https://fullstackopen.com/en/part1/introduction_to_react
    * https://www.joshwcomeau.com/react/why-react-re-renders/
    * https://www.joshwcomeau.com/react/usememo-and-usecallback/

# Setup
1. Run the `build.py` script in https://github.com/TinyCircuits/Thumby-Color-Website
2. Copy contents of `Thumby-Color-Website/site/simulator` to `app/public/simulator`
3. Copy contents of `Thumby-Color-Website/site/firmware` to `app/public/firmware`

# Running without backend:
1. `cd app`
2. `npm run dev`
3. `npx tailwindcss -i ./src/css/tailwind_input.css -o ./src/css/tailwind_output.css --watch`
4. Access: `http://localhost:5173/`


# Running with backend:
1. `./pocketbase serve`
2. `cd app`
3. `npm run build_watch`
4. `npx tailwindcss -i ./src/css/tailwind_input.css -o ./src/css/tailwind_output.css --watch`
5. Access `http://localhost:8090/`

NOTE on 404: https://github.com/pocketbase/pocketbase/discussions/3767


# Building
1. `npm run build`


# Pages
* /code/
* /arcade/