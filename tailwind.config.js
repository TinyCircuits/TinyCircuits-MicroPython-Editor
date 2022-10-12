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
    screens: {
      'tiny': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [require("daisyui")],
}