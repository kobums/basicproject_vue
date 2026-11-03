/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 베이스 URL (기본 '/api'). services/api.ts 가 읽는다. */
  readonly VITE_API_BASE_URL?: string
  /** dev 서버 프록시 대상 (vite.config.ts, 기본 http://localhost:8007). 번들에는 쓰지 않는다. */
  readonly VITE_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
