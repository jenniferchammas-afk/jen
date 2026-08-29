import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During local dev, Vite proxies /api/* to the Netlify Functions dev server
// (run with `netlify dev`, which serves functions on port 9999).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9999/.netlify/functions',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
