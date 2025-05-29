import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: ['tezjumush-production.up.railway.app'],
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  build: {
    // Улучшенные настройки для хостинга
    outDir: 'dist',
    assetsDir: 'assets',
    // Генерировать исходные карты для отладки
    sourcemap: false,
    // Минимизировать build
    minify: 'terser',
    // Настройки CSS
    cssCodeSplit: true,
    // Оптимизировать для продакшена
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        },
      },
    },
  },
})
