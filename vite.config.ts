import { defineConfig } from 'vite'
import { resolve } from 'path'

const buildId = (process.env.BUILD_ID ?? 'local').slice(0, 12)

export default defineConfig({
  base: '/ludumDare59/',
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@game': resolve(__dirname, 'src/game'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${buildId}.js`,
        chunkFileNames: `assets/[name]-[hash]-${buildId}.js`,
        assetFileNames: `assets/[name]-[hash]-${buildId}[extname]`,
      },
    },
  },
})
