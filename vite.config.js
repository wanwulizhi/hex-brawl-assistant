import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// H5 单页应用配置。
// base 设为相对路径，便于部署到 GitHub Pages 子目录，也便于被小程序 web-view 直接引用。
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 兼容微信内置浏览器与较旧的 Android WebView
    target: 'es2018',
    cssTarget: 'chrome61',
    chunkSizeWarningLimit: 1200,
  },
  server: {
    host: true,
    port: 5173,
  },
})
