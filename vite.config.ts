import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Dev: browser calls same-origin /api/v1 → proxied to Nest (avoids CORS and bad VITE_API_BASE_URL). */
const apiProxyTarget = process.env.VITE_DEV_API_PROXY ?? 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
