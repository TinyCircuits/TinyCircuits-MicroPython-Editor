# Setup
These are the steps taken to set this project up the first time. This is for reference and you likely don't need to follow this, see README.md instead.

1. https://fullstackopen.com/en/part1/introduction_to_react: inside TinyCircuits-Web-Programming-Platform: `npm create vite@latest . -- --template react`
2. `npm install`
3. `npm i tailwindcss daisyui react-daisyui`
4. `npx tailwindcss init`
5. Follow steps here: https://tailwindcss.com/docs/installation and here https://github.com/daisyui/react-daisyui related to `tailwind.config.js`
6. Run this whenever editing themes/daisyUI config: `npx tailwindcss -i ./src/tailwind_input.css -o ./src/tailwind_output.css --watch`
7. `npm run dev` to start local server
8. `npm install react-resizable-panels`