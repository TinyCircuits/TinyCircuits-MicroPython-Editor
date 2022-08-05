module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js}', 
            './dist/js/**/*.{html,js}',
            './dist/modules/Tabs-Handler/**/*.{html,js}',
            './dist/modules/code-editor/**/*.{html,js}',
            './dist/modules/workspace-selection/**/*.{html,js}',
            './dist/modules/projects/**/*.{html,js}',
            './dist/modules/sprite-editor/**/*.{html,js}'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}