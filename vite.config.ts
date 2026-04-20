import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/ludumDare59/',
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'src/engine'),
      '@game': resolve(__dirname, 'src/game'),
    },
  },
})
