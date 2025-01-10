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
        login: resolve(__dirname, 'code/login/index.html'),

        forgot: resolve(__dirname, 'code/login/forgot/index.html'),
        confirm_password: resolve(__dirname, 'code/login/confirm/password/index.html'),

        resend: resolve(__dirname, 'code/login/resend/index.html'),
        confirm_email: resolve(__dirname, 'code/login/confirm/email/index.html'),

        account: resolve(__dirname, 'code/account/index.html'),
        arcade: resolve(__dirname, 'code/arcade/index.html'),
        submit: resolve(__dirname, 'code/arcade/submit/index.html'),

        privacy: resolve(__dirname, 'code/privacy/index.html'),
      },
    },
  },

  plugins: [react()],

  worker: {
    format: "es",
  },
})
