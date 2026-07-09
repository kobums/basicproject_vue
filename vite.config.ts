import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // dev에서 /api, /uploads 요청을 Spring Boot(8081)로 프록시 → same-origin, CORS preflight 회피
    proxy: {
      '/api': 'http://localhost:8081',
      '/uploads': 'http://localhost:8081',
    },
  },
})
