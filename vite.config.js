import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
// https://vite.dev/guide/build.html#multi-page-app
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login/index.html'),
        resend: resolve(__dirname, 'login/resend/index.html'),
        resend: resolve(__dirname, 'login/forgot/index.html'),
        account: resolve(__dirname, 'account/index.html'),
        arcade: resolve(__dirname, 'arcade/index.html'),
        submit: resolve(__dirname, 'arcade/submit/index.html'),
      },
    },
  },

  plugins: [react()],
})
