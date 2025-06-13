import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-markdown', 'rehype-raw', 'rehype-sanitize', 'remark-gfm']
  }
})
