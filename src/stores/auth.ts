import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchMe,
  login as loginApi,
  signup as signupApi,
  type AuthResult,
  type AuthUser,
  type LoginRequest,
  type SignupRequest,
} from '../api/auth'
import { getToken, setToken } from '../lib/authStorage'
import { setTokenProvider, setUnauthorizedHandler } from '../services/api'

// 앱 전역 인증 상태 (Pinia setup store).
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)

  // 복구(/auth/me)가 진행 중인 동안의 Promise. 라우터 가드가 인증 판단 전에 기다린다.
  // 이게 없으면 보호 페이지를 새로고침했을 때 복구가 끝나기 전에 가드가 실행되어
  // 유효한 토큰이 있어도 로그인 페이지로 튕긴다.
  let restorePromise: Promise<void> | null = null

  const isAuthenticated = computed(() => user.value !== null)

  function clear(): void {
    setToken(null)
    user.value = null
  }

  // 앱 시작 시 main.ts 에서 1회 호출.
  // 토큰과 401 처리는 여기 한 곳에서 services/api.ts (생성 모델과 auth API 가 같이 쓰는 클라이언트)에 연결한다.
  function init(): void {
    setTokenProvider(getToken)
    // 어느 요청이든 401(토큰 만료/무효)이면 토큰을 비우고 로그아웃 상태로 바꾼다.
    // Go 의 HTTP 200 + code "auth error" 는 권한 부족(남의 글 등)일 수도 있어서 로그아웃하지 않는다.
    setUnauthorizedHandler(clear)

    // 저장된 토큰이 있으면 /auth/me 로 사용자 정보를 복구한다.
    if (!getToken()) return
    restorePromise = fetchMe()
      .then((me) => {
        user.value = me
      })
      .catch(() => {
        // 401 이면 위 핸들러가 이미 비웠다. 그 밖의 실패(서버 다운 등)도 로그인 상태로 두지 않는다.
        user.value = null
      })
      .finally(() => {
        restorePromise = null
      })
  }

  // 복구가 진행 중이면 끝날 때까지 대기 (아니면 즉시 반환).
  async function waitForRestore(): Promise<void> {
    if (restorePromise) await restorePromise
  }

  // 토큰을 저장하고, 응답에 사용자가 없으면 /auth/me 로 읽는다.
  async function startSession(result: AuthResult): Promise<AuthUser> {
    setToken(result.token)
    try {
      user.value = result.user ?? (await fetchMe())
    } catch (e) {
      clear()
      throw e
    }
    return user.value
  }

  async function login(body: LoginRequest): Promise<AuthUser> {
    return startSession(await loginApi(body))
  }

  async function signup(body: SignupRequest): Promise<AuthUser> {
    return startSession(await signupApi(body))
  }

  function logout(): void {
    clear()
  }

  return {
    user,
    isAuthenticated,
    init,
    waitForRestore,
    login,
    signup,
    logout,
  }
})
