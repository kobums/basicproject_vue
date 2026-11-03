/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // dev 에서 /api, /uploads 요청을 백엔드로 프록시 → same-origin, CORS preflight 회피.
  // 백엔드 주소는 VITE_PROXY_TARGET (.env.local 등). 기본은 Go(basicproject_go) :8007.
  //   Go  http://localhost:8007 / Spring http://localhost:8081 / Rust http://localhost:8008 (PORT 기본값)
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const target = env.VITE_PROXY_TARGET || 'http://localhost:8007'

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': target,
        '/uploads': target,
      },
    },
    test: {
      environment: 'happy-dom',
      include: ['tests/**/*.test.ts'],
    },
  }
})
