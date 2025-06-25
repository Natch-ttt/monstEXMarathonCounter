/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy }     from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve'
    ? '/'   // ローカル起動時はルート
    : '/monstEXMarathonCounter/', // GitHub Pages 用サブパス
  plugins: [
    vue(),
    legacy(),
    viteStaticCopy({
      targets: [
        {
          // Ionic の dist/ionic 内のエントリーファイルを assets のルートにコピー
          src: path.resolve(__dirname, 'node_modules/@ionic/core/dist/ionic/*.entry.js'),
          dest: 'assets',
          flatten: true
        },
        {
          src: path.resolve(__dirname, 'node_modules/@ionic/core/dist/ionic/*.sc.entry.js'),
          dest: 'assets',
          flatten: true
        }
      ]
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
