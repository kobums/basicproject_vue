import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '../types/user'
import { fetchMe } from '../api/auth'
import { getToken, setToken, UNAUTHORIZED_EVENT } from '../lib/authStorage'

// 앱 전역 인증 상태 (Pinia setup store).
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  // 복구(/auth/me)가 진행 중인 동안의 Promise. 라우터 가드가 인증 판단 전에 기다린다.
  // 이게 없으면 보호 페이지를 새로고침했을 때 복구가 끝나기 전에 가드가 실행되어
  // 유효한 토큰이 있어도 로그인 페이지로 튕긴다.
  let restorePromise: Promise<void> | null = null

  const isAuthenticated = computed(() => user.value !== null)

  // 앱 시작 시 main.ts 에서 1회 호출.
  function init(): void {
    // 401 발생 시(다른 요청 중 토큰 만료) client.ts 가 이벤트를 쏜다 → 로그아웃 상태로 동기화.
    window.addEventListener(UNAUTHORIZED_EVENT, () => {
      user.value = null
    })

    // 저장된 토큰이 있으면 /auth/me 로 사용자 정보를 복구한다.
    if (!getToken()) return
    restorePromise = fetchMe()
      .then((me) => {
        user.value = me
      })
      .catch(() => {
        // 토큰이 만료/무효면 client.ts 가 이미 토큰을 비우고 이벤트를 쏜다.
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

  // 토큰 + 사용자 정보를 받아 로그인 상태로 전환
  function setSession(token: string, nextUser: User): void {
    setToken(token)
    user.value = nextUser
  }

  function logout(): void {
    setToken(null)
    user.value = null
  }

  return { user, isAuthenticated, init, waitForRestore, setSession, logout }
})
