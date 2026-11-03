// 생성 composable(useBoard / useUser)이 Go 모양과 Spring 모양 응답에서 같은 결과를 내는지 확인한다.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBoard } from '../src/composables/useBoard'
import { useUser } from '../src/composables/useUser'
import { ApiError } from '../src/models/contract'
import { HttpError, setTokenProvider } from '../src/services/api'
import { errorMessage } from '../src/lib/errors'
import { mockFetch } from './helpers'

const author = {
  id: 7,
  email: 'a@b.c',
  name: '홍길동',
  level: 1,
  createddate: '2026-01-01 00:00:00',
}
const board = {
  id: 3,
  title: '제목',
  content: '내용',
  img: null,
  user: 7,
  createddate: '2026-01-02 03:04:05',
  extra: { user: author },
}

// Go: {items, total, code} / {item, code} / {id, code} / {code}
const go = {
  list: { items: [board], total: 21, code: 'ok' },
  item: { item: board, code: 'ok' },
  missing: { item: null, code: 'ok' },
  created: { id: 3, code: 'ok' },
  done: { code: 'ok' },
}

// Spring: Page / 엔티티 / 엔티티 / {success}
const spring = {
  list: {
    content: [board],
    page: 1,
    size: 10,
    pagesize: 10,
    totalElements: 21,
    totalPages: 3,
    first: true,
    last: false,
    empty: false,
  },
  item: board,
  created: board,
  done: { success: true },
}

beforeEach(() => {
  setTokenProvider(() => 'tok')
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe.each([
  ['Go', go],
  ['Spring', spring],
])('useBoard (%s 응답)', (_name, shape) => {
  it('fetchPage: 1-based page/pagesize 로 부르고 items / total 을 채운다', async () => {
    const { calls } = mockFetch({ body: shape.list })
    const b = useBoard()
    const pending = b.fetchPage({ page: 1, pagesize: 10, orderby: 'id desc' })
    expect(b.loading.value).toBe(true)
    await pending
    expect(calls[0].url).toBe('/api/board?page=1&pagesize=10&orderby=id+desc')
    expect(calls[0].headers.Authorization).toBe('Bearer tok')
    expect(b.items.value).toEqual([board])
    expect(b.items.value[0].extra?.user?.name).toBe('홍길동')
    expect(b.total.value).toBe(21)
    expect(b.loading.value).toBe(false)
    expect(b.error.value).toBeNull()
  })

  it('fetchOne: 단건을 item 에 넣는다', async () => {
    const { calls } = mockFetch({ body: shape.item })
    const b = useBoard()
    await b.fetchOne(3)
    expect(calls[0].url).toBe('/api/board/3')
    expect(b.item.value).toEqual(board)
  })

  it('create: 생성한 id 를 돌려준다 (Go 는 {id}, Spring 은 엔티티)', async () => {
    const { calls } = mockFetch({ body: shape.created })
    const b = useBoard()
    const created = await b.create({
      title: '제목',
      content: '내용',
      img: null,
    })
    expect(calls[0].method).toBe('POST')
    expect(calls[0].url).toBe('/api/board')
    expect(created?.id).toBe(3)
    expect(b.error.value).toBeNull()
  })

  it('update / remove: PUT · DELETE /board/{id}', async () => {
    const { calls } = mockFetch({ body: shape.done })
    const b = useBoard()
    await b.update(3, { title: '새 제목' })
    await b.remove(3)
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual([
      'PUT /api/board/3',
      'DELETE /api/board/3',
    ])
    expect(calls[0].body).toEqual({ title: '새 제목' })
    expect(b.error.value).toBeNull()
  })
})

describe('에러는 composable 의 error 에 담긴다', () => {
  it('Go: HTTP 200 + code "auth error" → ApiError', async () => {
    mockFetch({ body: { code: 'auth error' } })
    const b = useBoard()
    await b.fetchPage({ page: 1, pagesize: 10 })
    expect(b.error.value).toBeInstanceOf(ApiError)
    expect((b.error.value as ApiError).code).toBe('auth error')
    expect(b.items.value).toEqual([])
    expect(errorMessage(b.error.value, 'x')).toContain('권한')
  })

  it('Go: 없는 행은 {item: null} → item null, 에러 아님', async () => {
    mockFetch({ body: go.missing })
    const b = useBoard()
    await b.fetchOne(99)
    expect(b.item.value).toBeNull()
    expect(b.error.value).toBeNull()
  })

  it('Spring: 404 → HttpError, 403 (남의 글 삭제) → HttpError', async () => {
    mockFetch({ status: 404 }, { status: 403 })
    const b = useBoard()
    await b.fetchOne(99)
    expect(b.item.value).toBeNull()
    expect((b.error.value as HttpError).status).toBe(404)
    await b.remove(1)
    expect((b.error.value as HttpError).status).toBe(403)
    expect(errorMessage(b.error.value, 'x')).toBe('권한이 없습니다.')
  })

  it('다음 요청이 성공하면 error 를 비운다', async () => {
    mockFetch({ body: { code: 'error' } }, { body: go.list })
    const b = useBoard()
    await b.fetchPage({ page: 1, pagesize: 10 })
    expect(b.error.value).toBeInstanceOf(ApiError)
    await b.fetchPage({ page: 1, pagesize: 10 })
    expect(b.error.value).toBeNull()
    expect(b.total.value).toBe(21)
  })
})

describe('useUser', () => {
  it('검색 필터(name)와 페이지를 그대로 보낸다', async () => {
    const { calls } = mockFetch({
      body: { items: [author], total: 1, code: 'ok' },
    })
    const u = useUser()
    await u.fetchPage({ page: 2, pagesize: 5, name: '홍길동' })
    expect(calls[0].url).toBe(
      `/api/user?page=2&pagesize=5&name=${encodeURIComponent('홍길동')}`,
    )
    expect(u.items.value).toEqual([author])
    expect(u.total.value).toBe(1)
  })

  it('create 는 비밀번호 컬럼 passwd 를 본문에 보낸다', async () => {
    const { calls } = mockFetch({ body: { id: 9, code: 'ok' } })
    const u = useUser()
    const created = await u.create({ email: 'x@y.z', name: 'x', passwd: 'pw' })
    expect(calls[0].body).toEqual({ email: 'x@y.z', name: 'x', passwd: 'pw' })
    expect(created?.id).toBe(9)
  })
})
