// 인증 API (손으로 만든 파일). 생성 모델과 같은 클라이언트(services/api.ts)를 쓴다.
//
//   POST /api/auth/login   { email, password }        → { token, user? }
//   POST /api/auth/signup  { email, name, password }  → { token, user? }
//   GET  /api/auth/me      (Authorization: Bearer)    → user
//
// 백엔드마다 모양이 조금 달라서 너그럽게 읽는다.
//   - 토큰 key: token | accessToken | access_token
//   - 사용자: user 필드, 없으면 로그인 뒤 /auth/me 로 다시 읽는다 (stores/auth.ts)
//   - Go 식 봉투: { code: "ok", ... }, { code, item: {...} }, { data: {...} } 도 벗긴다.
//     HTTP 200 + code "error" | "auth error" | "bad request" 는 ApiError 로 던진다.
//   - 사용자 날짜는 createddate(생성 모델) 또는 createdAt(예전 DTO) 어느 쪽이든 createddate 로 맞춘다.
import { get, post } from '../services/api'
import { checkGoError } from '../models/contract'
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

/** 로그인한 사용자. id / email / name 은 꼭 있고 나머지는 백엔드에 따라 없을 수 있다. */
export type AuthUser = Pick<User, 'id' | 'email' | 'name'> &
  Partial<Omit<User, 'id' | 'email' | 'name'>>

export interface AuthResult {
  token: string
  /** 응답에 사용자가 없으면 null (호출한 쪽이 /auth/me 로 읽는다). */
  user: AuthUser | null
}

type Json = Record<string, unknown>

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 응답 본문과 그 안의 봉투(item / data / result)를 바깥부터 차례로 돌려준다.
function layers(data: unknown): Json[] {
  const ret: Json[] = []
  let cur: unknown = data
  while (isRecord(cur) && ret.length < 4) {
    ret.push(cur)
    cur = cur.item ?? cur.data ?? cur.result
  }
  return ret
}

function tokenOf(obj: Json): string | null {
  for (const key of ['token', 'accessToken', 'access_token']) {
    const value = obj[key]
    if (typeof value === 'string' && value !== '') return value
  }
  return null
}

/** 사용자 객체로 보이면 AuthUser 로 바꾼다 (id 가 숫자 / 숫자 문자열이어야 한다). */
export function toAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null
  const id = typeof value.id === 'string' ? Number(value.id) : value.id
  if (typeof id !== 'number' || Number.isNaN(id)) return null
  const user = { ...value, id } as AuthUser & Json
  // 비밀번호는 응답에 없어야 하지만, 혹시 있어도 상태에 두지 않는다.
  delete user.passwd
  delete user.password
  user.email = typeof value.email === 'string' ? value.email : ''
  user.name = typeof value.name === 'string' ? value.name : ''
  if (user.createddate === undefined && typeof value.createdAt === 'string') {
    user.createddate = value.createdAt
  }
  delete user.createdAt
  return user
}

/** /auth/me 응답: 사용자 그대로, 또는 { user } / { item } / { data } 봉투. */
export function parseUser(data: unknown): AuthUser | null {
  checkGoError(data)
  for (const layer of layers(data)) {
    const user = toAuthUser(layer.user) ?? toAuthUser(layer)
    if (user) return user
  }
  return null
}

/** 로그인 / 회원가입 응답에서 토큰과 (있으면) 사용자를 꺼낸다. 토큰이 없으면 던진다. */
export function parseAuthResponse(data: unknown): AuthResult {
  checkGoError(data)
  let token: string | null = null
  let user: AuthUser | null = null
  for (const layer of layers(data)) {
    token ??= tokenOf(layer)
    user ??= toAuthUser(layer.user)
  }
  if (!token) {
    throw new Error('인증 응답에 토큰이 없습니다.')
  }
  return { token, user }
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
  const user = parseUser(res.data)
  if (!user) {
    throw new Error('사용자 정보를 읽지 못했습니다.')
  }
  return user
}
