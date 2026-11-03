// 인증 API 계약 (gomachine README "인증 API 계약"): {token, tokenType, expiresInMs, user}, user = {id, email, name, level, createddate}
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { parseAuthResponse, parseUser } from '../src/api/auth'
import { useAuthStore } from '../src/stores/auth'
import { TOKEN_KEY, getToken, setToken } from '../src/lib/authStorage'
import { HttpError, get } from '../src/services/api'
import { fieldErrorsOf } from '../src/lib/errors'
import { mockFetch } from './helpers'

const user = {
  id: 7,
  email: 'a@b.c',
  name: '홍길동',
  level: 1,
  createddate: '2026-01-01 09:00:00',
}
const authBody = {
  token: 'tok',
  tokenType: 'Bearer',
  expiresInMs: 86400000,
  user,
}

describe('parseAuthResponse (login / signup 응답)', () => {
  it('계약 모양 {token, tokenType, expiresInMs, user}', () => {
    expect(parseAuthResponse(authBody)).toEqual(authBody)
  })

  it('user 는 계약 필드만 남기고 비밀번호는 버린다', () => {
    const res = parseAuthResponse({
      ...authBody,
      user: { ...user, passwd: 'x', password: 'y' },
    })
    expect(res.user).toEqual(user)
  })

  it('토큰이나 사용자가 없으면 던진다', () => {
    expect(() => parseAuthResponse({ user })).toThrow('토큰')
    expect(() => parseAuthResponse('')).toThrow('토큰')
    expect(() => parseAuthResponse({ token: 't' })).toThrow('사용자')
  })
})

describe('parseUser (/auth/me 응답)', () => {
  it('user 그대로', () => {
    expect(parseUser(user)).toEqual(user)
  })

  it('사용자가 아니면 던진다', () => {
    expect(() => parseUser({ code: 'ok' })).toThrow()
    expect(() => parseUser({ ...user, id: '7' })).toThrow()
  })
})

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setToken(null)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('login: 토큰과 사용자를 저장한다 (/auth/me 를 부르지 않는다)', async () => {
    const { calls } = mockFetch({ body: authBody })
    const auth = useAuthStore()
    auth.init()
    await auth.login({ email: 'a@b.c', password: 'pw' })
    expect(getToken()).toBe('tok')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok')
    expect(auth.user).toEqual(user)
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'POST /api/auth/login',
    ])
  })

  it('signup: 201 + 본문 {email, password, name}', async () => {
    const { calls } = mockFetch({ status: 201, body: authBody })
    const auth = useAuthStore()
    auth.init()
    await auth.signup({ email: 'a@b.c', name: '홍길동', password: 'pw' })
    expect(auth.isAuthenticated).toBe(true)
    expect(calls[0].url).toBe('/api/auth/signup')
    expect(calls[0].body).toEqual({
      email: 'a@b.c',
      name: '홍길동',
      password: 'pw',
    })
  })

  it('signup 409 / 400: HttpError 와 fieldErrors', async () => {
    mockFetch(
      { status: 409, body: { status: 409, message: '이미 있는 email' } },
      {
        status: 400,
        body: { status: 400, message: '검증', fieldErrors: { email: '형식' } },
      },
    )
    const auth = useAuthStore()
    auth.init()
    const body = { email: 'a', name: 'b', password: 'c' }
    await expect(auth.signup(body)).rejects.toMatchObject({
      status: 409,
      message: '이미 있는 email',
    })
    const err = await auth.signup(body).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(HttpError)
    expect(fieldErrorsOf(err)).toEqual({ email: '형식' })
    expect(auth.isAuthenticated).toBe(false)
    expect(getToken()).toBeNull()
  })

  it('isAdmin: level 이 ADMIN_LEVEL(3) 이상일 때만', async () => {
    mockFetch({ body: { ...authBody, user: { ...user, level: 3 } } })
    const auth = useAuthStore()
    auth.init()
    expect(auth.isAdmin).toBe(false)
    await auth.login({ email: 'a', password: 'b' })
    expect(auth.isAdmin).toBe(true)
  })

  it('init: 저장된 토큰을 /auth/me 로 복구하고, 이후 어느 요청이든 401 이면 로그아웃', async () => {
    setToken('old')
    const { calls } = mockFetch({ body: user }, { status: 401, body: {} })
    const auth = useAuthStore()
    auth.init()
    await auth.waitForRestore()
    expect(calls[0].url).toBe('/api/auth/me')
    expect(calls[0].headers.Authorization).toBe('Bearer old')
    expect(auth.user).toEqual(user)

    await expect(get('/board')).rejects.toThrow()
    expect(auth.user).toBeNull()
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('init: 복구 실패(401)면 토큰을 비운다', async () => {
    setToken('expired')
    mockFetch({ status: 401, body: { status: 401, message: '만료' } })
    const auth = useAuthStore()
    auth.init()
    await auth.waitForRestore()
    expect(auth.isAuthenticated).toBe(false)
    expect(getToken()).toBeNull()
  })
})
