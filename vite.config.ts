/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve'
    ? '/'   // ローカル起動時はルート
    : './', // GitHub Pages 用サブパス
  plugins: [
    vue(),
    legacy(),
    createHtmlPlugin({
      inject: {
        data: {
          ionicEsm: 'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js',
          ionicNomodule: 'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.js',
          ionicCss: 'https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
}))
