import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    host: true,
    allowedHosts: [
      'pepeusdindex.lol',
      'www.pepeusdindex.lol',
      'localhost',
      '127.0.0.1'
    ]
  }
}) 