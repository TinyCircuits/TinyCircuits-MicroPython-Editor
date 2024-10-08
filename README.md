# TinyCircuits-MicroPython-Editor
Web IDE focused on editing, running, and uploading MicroPython code on and to TinyCircuits' devices.

TODO: Add popup on run and hide run location and source location. Source location only matters for opening files from computer and running on simulator

# Libraries
* Framework: [ReactJS](https://react.dev/)
* Editor: [CodeMirror](https://codemirror.net/) + [ReactJS](https://react.dev/) = [React CodeMirror](https://uiwjs.github.io/react-codemirror/)
* Tabs: [react-tabs-draggable](https://github.com/uiwjs/react-tabs-draggable)
* File Tree: [react-complex-tree](https://github.com/lukasbach/react-complex-tree)
* Terminal: [xterm.js](https://github.com/xtermjs/xterm.js) + [ReactJS](https://react.dev/) = [xterm-react](https://github.com/PabloLION/xterm-react)
* Communication: [ViperIDE](https://github.com/vshymanskyy/ViperIDE/blob/main/src/transports.js)
* Simulator: [MicroPython](https://github.com/micropython/micropython)
* Style: [tailwindcss](https://github.com/tailwindlabs/tailwindcss) + [daisyUI](https://github.com/saadeghi/daisyui) + [ReactJS](https://react.dev/) = [ReactJS daisyUI](https://react.daisyui.com/?path=/docs/welcome--docs)
* Layout: [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
* Backend: [pocketbase](https://pocketbase.io/)
* Server: [BuyVM](https://buyvm.net/)


# Resources
* Learning react: https://fullstackopen.com/en/part1/introduction_to_react


# Running:
1. `npm run dev`
2. `npx tailwindcss -i ./src/tailwind_input.css -o ./tailwind_output.css --watch`