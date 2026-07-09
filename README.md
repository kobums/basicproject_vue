# basicproject_vue

`basicproject_web`(React)과 동일한 기능을 Vue 3 로 구현한 학습용 프론트엔드.
같은 Spring Boot 백엔드(`basicproject_springboot`, :8081)를 사용한다.

## 기술 스택

- Vue 3 + TypeScript + Vite
- vue-router 4 (라우팅 + 인증 가드)
- 상태 관리 라이브러리 없음 — 모듈 스코프 `ref` + composable 로 직접 구현
- axios 없음 — fetch 래퍼(`src/api/client.ts`) 직접 구현

## 실행

```bash
npm install
npm run dev     # http://localhost:5173 (API 는 :8081 으로 프록시)
npm run build   # 타입체크(vue-tsc) + 프로덕션 빌드
```

## React 버전과의 대응

| React (`basicproject_web`) | Vue (`basicproject_vue`) |
| --- | --- |
| Context + Provider (`AuthProvider`, `FeedbackProvider`) | 모듈 스코프 ref + composable (`stores/auth.ts`, `stores/feedback.ts`) |
| `<RequireAuth>` 래퍼 컴포넌트 | 라우트 `meta.requiresAuth` + `router.beforeEach` 가드 |
| 커스텀 훅 (`useBoards` 등) | composable (`composables/useBoards.ts` 등) |
| `createPortal` (모달/토스트) | `<Teleport to="body">` |
| `useState` / `useEffect` | `ref` / `watch` |
