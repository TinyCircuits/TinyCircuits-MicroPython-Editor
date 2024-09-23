/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx}",
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      "light",
      {
        dim: {
          ...require("daisyui/src/theming/themes")["dim"],
          // "--rounded-btn": "0rem",
          // ".collapse-title, :where(.collapse > input[type=\"checkbox\"]), :where(.collapse > input[type=\"radio\"])": {
          //   "padding": "0px !important",
          //   "min-height": "0px !important",
          //   "padding-inline-end": "0px !important"
          // }
          ".collapse-content": {
            "padding": "0px !important",
            "min-height": "0px !important",
            "padding-inline-end": "0px !important",
          },
          ".collapse": {
            "border-radius": "0px !important",
          },
        },
      },
      "cupcake",
      "dim",
      "synthwave",
      "retro",
      "black"],
  },
}

