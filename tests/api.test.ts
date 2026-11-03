import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HttpError,
  del,
  get,
  post,
  setTokenProvider,
  setUnauthorizedHandler,
} from '../src/services/api'
import { mockFetch } from './helpers'

describe('services/api.ts (단일 HTTP 클라이언트)', () => {
  beforeEach(() => {
    setTokenProvider(() => null)
    setUnauthorizedHandler(null)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('VITE_API_BASE_URL(/api) 앞에 붙이고 빈 params 는 뺀다', async () => {
    const { calls } = mockFetch({ body: { items: [] } })
    const res = await get('/board', {
      params: { page: 1, pagesize: 10, title: '', user: undefined },
    })
    expect(calls[0].url).toBe('/api/board?page=1&pagesize=10')
    expect(res).toEqual({ data: { items: [] }, status: 200 })
  })

  it('setTokenProvider 의 토큰을 Bearer 로 보낸다', async () => {
    const { calls } = mockFetch({ body: {} })
    setTokenProvider(() => 'abc')
    await post('/board', { title: 't' })
    expect(calls[0].headers.Authorization).toBe('Bearer abc')
    expect(calls[0].headers['Content-Type']).toBe('application/json')
    expect(calls[0].body).toEqual({ title: 't' })
  })

  it('토큰이 없으면 Authorization 을 보내지 않는다', async () => {
    const { calls } = mockFetch({ body: {} })
    await get('/user')
    expect(calls[0].headers.Authorization).toBeUndefined()
  })

  it('FormData 는 Content-Type 을 직접 넣지 않는다', async () => {
    const { calls } = mockFetch({ body: { filename: 'a.png' } })
    const form = new FormData()
    form.append('upload', new Blob(['x']), 'a.png')
    await post('/upload/index', form)
    expect(calls[0].headers['Content-Type']).toBeUndefined()
    expect(calls[0].body).toBeInstanceOf(FormData)
  })

  it('401 이면 setUnauthorizedHandler 를 부르고 HttpError 를 던진다', async () => {
    mockFetch({ status: 401, body: { message: '인증이 필요합니다.' } })
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    const err = await get('/auth/me').catch((e: unknown) => e)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(err).toBeInstanceOf(HttpError)
    expect((err as HttpError).status).toBe(401)
    expect((err as HttpError).message).toBe('인증이 필요합니다.')
  })

  it('401 이 아닌 에러는 핸들러를 부르지 않고 fieldErrors 를 담는다', async () => {
    mockFetch({
      status: 400,
      body: { message: 'validation failed', fieldErrors: { email: '필수' } },
    })
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    const err = (await post('/auth/signup', {}).catch(
      (e: unknown) => e,
    )) as HttpError
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(err.status).toBe(400)
    expect(err.fieldErrors).toEqual({ email: '필수' })
  })

  it('Spring 409 {error} 도 메시지로 쓴다', async () => {
    mockFetch({ status: 409, body: { error: 'constraint violation' } })
    const err = (await post('/user', {}).catch((e: unknown) => e)) as HttpError
    expect(err.message).toBe('constraint violation')
  })

  it('del 은 cfg.data 를 본문으로 보내고 빈 본문(204)은 undefined', async () => {
    const { calls } = mockFetch({ status: 204 })
    const res = await del('/board/batch', { data: [{ id: 1 }] })
    expect(calls[0].method).toBe('DELETE')
    expect(calls[0].body).toEqual([{ id: 1 }])
    expect(res.data).toBeUndefined()
  })
})
