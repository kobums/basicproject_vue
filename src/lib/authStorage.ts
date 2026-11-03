// 토큰을 localStorage 에 보관하는 작은 저장소.
// services/api.ts 는 stores/auth.ts 가 연결한 setTokenProvider(getToken) 로 여기서 토큰을 읽는다.
export const TOKEN_KEY = 'basicproject.token'

function read(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

let current: string | null = read()

export function getToken(): string | null {
  return current
}

export function setToken(token: string | null): void {
  current = token
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // 저장소를 쓸 수 없는 환경(사파리 프라이빗 모드 등)은 메모리에만 둔다
  }
}
