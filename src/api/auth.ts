// 인증 API (손으로 만든 파일). 생성 모델과 같은 클라이언트(services/api.ts)를 쓴다.
// gomachine "인증 API 계약" (Go / Spring / Rust 백엔드 템플릿이 같은 모양으로 구현한다):
//
//   POST /api/auth/signup  { email, password, name }  → 201 { token, tokenType: "Bearer", expiresInMs, user }
//   POST /api/auth/login   { email, password }        → 200 { token, tokenType: "Bearer", expiresInMs, user }
//   GET  /api/auth/me      (Authorization: Bearer)    → 200 user
//
//   user = { id, email, name, level, createddate }  (생성된 User 응답과 같다, 비밀번호 없음)
//   실패는 HTTP 상태 코드 + { status, message, fieldErrors? } → services/api.ts 가 HttpError 로 던진다.
import { get, post } from '../services/api'
import type { User } from '../types/user'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  name: string
  password: string
}

/** 로그인한 사용자 = 생성된 User 응답 (비밀번호 없음). */
export type AuthUser = Omit<User, 'passwd'>

export interface AuthResult {
  token: string
  tokenType: string
  /** 토큰 유효 시간 (밀리초, 백엔드 JWT_EXPIRATION_MS). */
  expiresInMs: number
  user: AuthUser
}

type Json = Record<string, unknown>

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 계약의 user 객체면 AuthUser 로, 아니면 null. 비밀번호 필드가 있어도 버린다. */
export function toAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null
  const { id, email, name, level, createddate } = value
  if (typeof id !== 'number' || typeof email !== 'string') return null
  return {
    id,
    email,
    name: typeof name === 'string' ? name : '',
    level: typeof level === 'number' ? level : 0,
    createddate: typeof createddate === 'string' ? createddate : '',
  }
}

/** /auth/me 응답 (user 그대로). */
export function parseUser(data: unknown): AuthUser {
  const user = toAuthUser(data)
  if (!user) throw new Error('사용자 정보를 읽지 못했습니다.')
  return user
}

/** 로그인 / 회원가입 응답. token 이나 user 가 없으면 던진다. */
export function parseAuthResponse(data: unknown): AuthResult {
  if (!isRecord(data) || typeof data.token !== 'string' || !data.token) {
    throw new Error('인증 응답에 토큰이 없습니다.')
  }
  const user = toAuthUser(data.user)
  if (!user) throw new Error('인증 응답에 사용자 정보가 없습니다.')
  return {
    token: data.token,
    tokenType: typeof data.tokenType === 'string' ? data.tokenType : 'Bearer',
    expiresInMs: typeof data.expiresInMs === 'number' ? data.expiresInMs : 0,
    user,
  }
}

export async function login(body: LoginRequest): Promise<AuthResult> {
  const res = await post<unknown>('/auth/login', body)
  return parseAuthResponse(res.data)
}

export async function signup(body: SignupRequest): Promise<AuthResult> {
  const res = await post<unknown>('/auth/signup', body)
  return parseAuthResponse(res.data)
}

/** 저장된 토큰으로 현재 사용자 조회 (앱 시작 시 토큰 확인용). */
export async function fetchMe(): Promise<AuthUser> {
  const res = await get<unknown>('/auth/me')
  return parseUser(res.data)
}
