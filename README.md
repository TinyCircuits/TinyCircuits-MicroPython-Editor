# TinyCircuits-MicroPython-Editor
Web IDE focused on editing, running, and uploading MicroPython code on and to TinyCircuits' devices.

**NOTICE: Still in early development, most features do not work! Even the basics! (10/08/2024)**

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
* Learning react: https://fullstackopen.com/en/part1/introduction_to_react


# Running:
1. `npm run dev`
2. `npx tailwindcss -i ./src/tailwind_input.css -o ./tailwind_output.css --watch`