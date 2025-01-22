import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
// https://vite.dev/guide/build.html#multi-page-app
export default defineConfig({
  build: {
    target: "ES2022",     // https://github.com/remix-run/remix/issues/7969#issuecomment-1806322036
    outDir: '../pb_public',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'code/index.html'),
        arcade: resolve(__dirname, 'code/arcade/index.html'),
      },
    },
  },

  plugins: [react()],

  worker: {
    format: "es",
  },
})
