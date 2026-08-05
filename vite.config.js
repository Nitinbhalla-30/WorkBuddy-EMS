import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is relative so the same build can later run inside Electron.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true
  }
})
