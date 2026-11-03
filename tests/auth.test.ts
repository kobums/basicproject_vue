import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { parseAuthResponse, parseUser } from '../src/api/auth'
import { ApiError } from '../src/models/contract'
import { useAuthStore } from '../src/stores/auth'
import { TOKEN_KEY, getToken, setToken } from '../src/lib/authStorage'
import { get } from '../src/services/api'
import { mockFetch } from './helpers'

const user = { id: 7, email: 'a@b.c', name: '홍길동', level: 1 }

describe('parseAuthResponse (login / signup 응답)', () => {
  it.each([
    [
      '{token, user} (Spring / basicproject_go)',
      { token: 't1', tokenType: 'Bearer', user },
    ],
    ['{accessToken, user}', { accessToken: 't1', user }],
    ['{access_token}', { access_token: 't1', user }],
    ['Go 봉투 {code: ok, token, user}', { code: 'ok', token: 't1', user }],
    [
      'Go 봉투 {code, item: {token, user}}',
      { code: 'ok', item: { token: 't1', user } },
    ],
    ['{data: {accessToken, user}}', { data: { accessToken: 't1', user } }],
  ])('%s', (_name, body) => {
    const res = parseAuthResponse(body)
    expect(res.token).toBe('t1')
    expect(res.user).toMatchObject(user)
  })

  it('사용자가 없으면 user: null ({token} 만)', () => {
    expect(parseAuthResponse({ token: 't1' })).toEqual({
      token: 't1',
      user: null,
    })
  })

  it('Go 의 HTTP 200 + code 에러는 ApiError', () => {
    expect(() => parseAuthResponse({ code: 'error' })).toThrow(ApiError)
    expect(() => parseAuthResponse({ code: 'auth error' })).toThrow(ApiError)
  })

  it('토큰이 없으면 던진다', () => {
    expect(() => parseAuthResponse({ user })).toThrow('토큰')
    expect(() => parseAuthResponse('')).toThrow('토큰')
  })
})

describe('parseUser (/auth/me 응답)', () => {
  it('사용자 그대로', () => {
    expect(parseUser(user)).toMatchObject(user)
  })

  it('예전 DTO 의 createdAt 을 createddate 로, 비밀번호는 버린다', () => {
    const me = parseUser({
      ...user,
      id: '7',
      createdAt: '2026-01-02T03:04:05',
      passwd: 'x',
    })
    expect(me).toMatchObject({ id: 7, createddate: '2026-01-02T03:04:05' })
    expect(me).not.toHaveProperty('passwd')
    expect(me).not.toHaveProperty('createdAt')
  })

  it.each([
    ['{user}', { user }],
    ['Go {item, code}', { item: user, code: 'ok' }],
    ['{code, user}', { code: 'ok', user }],
  ])('%s 봉투', (_name, body) => {
    expect(parseUser(body)).toMatchObject(user)
  })

  it('사용자가 아니면 null, Go code 에러는 ApiError', () => {
    expect(parseUser({ code: 'ok' })).toBeNull()
    expect(() => parseUser({ code: 'auth error' })).toThrow(ApiError)
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

  it('login: 토큰을 저장하고 응답에 사용자가 없으면 /auth/me 로 읽는다', async () => {
    const { calls } = mockFetch(
      { body: { accessToken: 'tok' } },
      { body: user },
    )
    const auth = useAuthStore()
    auth.init()
    await auth.login({ email: 'a@b.c', password: 'pw' })
    expect(getToken()).toBe('tok')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok')
    expect(auth.user).toMatchObject(user)
    expect(calls.map((c) => c.url)).toEqual(['/api/auth/login', '/api/auth/me'])
    expect(calls[1].headers.Authorization).toBe('Bearer tok')
  })

  it('signup: {token, user} 면 /auth/me 를 부르지 않는다', async () => {
    const { calls } = mockFetch({ status: 201, body: { token: 'tok', user } })
    const auth = useAuthStore()
    auth.init()
    await auth.signup({ email: 'a@b.c', name: '홍길동', password: 'pw' })
    expect(auth.isAuthenticated).toBe(true)
    expect(calls).toHaveLength(1)
  })

  it('init: 저장된 토큰으로 복구하고, 이후 어느 요청이든 401 이면 로그아웃', async () => {
    setToken('old')
    mockFetch({ body: { code: 'ok', item: user } }, { status: 401, body: {} })
    const auth = useAuthStore()
    auth.init()
    await auth.waitForRestore()
    expect(auth.user).toMatchObject(user)

    await expect(get('/board')).rejects.toThrow()
    expect(auth.user).toBeNull()
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('init: 복구 실패(401)면 토큰을 비운다', async () => {
    setToken('expired')
    mockFetch({ status: 401, body: { message: '만료' } })
    const auth = useAuthStore()
    auth.init()
    await auth.waitForRestore()
    expect(auth.isAuthenticated).toBe(false)
    expect(getToken()).toBeNull()
  })

  it('/auth/me 가 실패하면 로그인 상태로 두지 않는다', async () => {
    mockFetch({ body: { token: 'tok' } }, { status: 500, body: {} })
    const auth = useAuthStore()
    auth.init()
    await expect(auth.login({ email: 'a', password: 'b' })).rejects.toThrow()
    expect(auth.user).toBeNull()
    expect(getToken()).toBeNull()
  })
})
