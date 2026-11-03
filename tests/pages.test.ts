// 화면 권한: 게시글 수정 / 삭제 버튼은 작성자에게만, 회원 관리 화면은 관리자(level ≥ 3)에게만 보인다.
// 실제 권한 검사는 백엔드가 하고, 여기서는 버튼 / 화면 노출만 확인한다.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, type Component } from 'vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { RouterView, createMemoryHistory, createRouter } from 'vue-router'
import BoardDetailPage from '../src/pages/BoardDetailPage.vue'
import UserDetailPage from '../src/pages/UserDetailPage.vue'
import UserListPage from '../src/pages/UserListPage.vue'
import UserWritePage from '../src/pages/UserWritePage.vue'
import BoardEditPage from '../src/pages/BoardEditPage.vue'
import router from '../src/router'
import { useAuthStore } from '../src/stores/auth'
import {
  ADMIN_LEVEL,
  canManageUser,
  isAdmin,
  isOwner,
} from '../src/lib/permissions'
import { setToken } from '../src/lib/authStorage'
import { mockFetch } from './helpers'

const me = {
  id: 7,
  email: 'me@b.c',
  name: '나',
  level: 1,
  createddate: '2026-01-01 00:00:00',
}
const admin = { ...me, id: 1, email: 'admin@b.c', level: ADMIN_LEVEL }
const board = (owner: number) => ({
  item: {
    id: 3,
    title: '제목',
    content: '내용',
    img: null,
    user: owner,
    createddate: '2026-01-02 03:04:05',
    extra: { user: { ...me, id: owner } },
  },
  code: 'ok',
})

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 0))
    await nextTick()
  }
}

let pinia: Pinia
let host: HTMLElement
let unmount: (() => void) | null = null

function login(user: typeof me) {
  useAuthStore().user = user
}

async function mount(path: string, routes: Record<string, Component>) {
  const r = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...Object.entries(routes).map(([p, component]) => ({
        path: p,
        component,
      })),
      { path: '/:rest(.*)*', component: { render: () => null } },
    ],
  })
  await r.push(path)
  await r.isReady()
  const app = createApp(defineComponent({ render: () => h(RouterView) }))
  app.use(pinia).use(r)
  app.mount(host)
  unmount = () => app.unmount()
  await flush()
  return host
}

const buttons = (el: HTMLElement) =>
  [...el.querySelectorAll('a, button')].map((b) => b.textContent?.trim())

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  setToken('tok')
  host = document.createElement('div')
  document.body.appendChild(host)
})
afterEach(() => {
  unmount?.()
  unmount = null
  host.remove()
  setToken(null)
  vi.unstubAllGlobals()
})

describe('permissions', () => {
  it('isAdmin / isOwner / canManageUser', () => {
    expect(ADMIN_LEVEL).toBe(3)
    expect(isAdmin(me)).toBe(false)
    expect(isAdmin({ id: 1, level: 2 })).toBe(false)
    expect(isAdmin(admin)).toBe(true)
    expect(isAdmin(null)).toBe(false)
    expect(isOwner(me, { user: 7 })).toBe(true)
    expect(isOwner(me, { user: 8 })).toBe(false)
    expect(isOwner(null, { user: 7 })).toBe(false)
    expect(canManageUser(me, 7)).toBe(true)
    expect(canManageUser(me, 8)).toBe(false)
    expect(canManageUser(admin, 8)).toBe(true)
  })
})

describe('BoardDetailPage: 수정 / 삭제는 작성자에게만', () => {
  it('내 글이면 수정 / 삭제 버튼이 보인다', async () => {
    mockFetch({ body: board(7) })
    login(me)
    const el = await mount('/boards/3', { '/boards/:id': BoardDetailPage })
    expect(el.textContent).toContain('제목')
    expect(buttons(el)).toEqual(
      expect.arrayContaining(['목록', '수정', '삭제']),
    )
  })

  it('남의 글이면 (관리자여도) 목록 버튼만 보인다', async () => {
    mockFetch({ body: board(8) })
    login(admin)
    const el = await mount('/boards/3', { '/boards/:id': BoardDetailPage })
    expect(el.textContent).toContain('제목')
    expect(buttons(el)).toEqual(['목록'])
  })

  it('남의 글 수정 화면은 폼 대신 안내를 보여준다', async () => {
    mockFetch({ body: board(8) })
    login(me)
    const el = await mount('/boards/3/edit', {
      '/boards/:id/edit': BoardEditPage,
    })
    expect(el.textContent).toContain('작성자만 수정할 수 있습니다.')
    expect(el.querySelector('form')).toBeNull()
  })
})

describe('UserDetailPage: 본인 또는 관리자만 수정 / 삭제', () => {
  const other = { item: { ...me, id: 8, name: '남' }, code: 'ok' }

  it('본인이면 수정 / 탈퇴', async () => {
    mockFetch({ body: { item: me, code: 'ok' } })
    login(me)
    const el = await mount('/users/7', { '/users/:id': UserDetailPage })
    expect(buttons(el)).toEqual(expect.arrayContaining(['수정', '탈퇴']))
  })

  it('관리자는 다른 회원도 수정 / 삭제', async () => {
    mockFetch({ body: other })
    login(admin)
    const el = await mount('/users/8', { '/users/:id': UserDetailPage })
    expect(buttons(el)).toEqual(expect.arrayContaining(['수정', '삭제']))
  })

  it('관리자가 아니면 남의 정보에 버튼이 없다', async () => {
    mockFetch({ body: other })
    login(me)
    const el = await mount('/users/8', { '/users/:id': UserDetailPage })
    expect(buttons(el)).toEqual(['목록'])
  })
})

describe('UserListPage: 관리자 화면은 level ≥ 3', () => {
  const list = (items: unknown[]) => ({
    body: { items, total: items.length, code: 'ok' },
  })

  it('관리자가 아니면 내 정보만 (검색 / 회원 추가 없음)', async () => {
    mockFetch(list([me]))
    login(me)
    const el = await mount('/users', { '/users': UserListPage })
    expect(el.querySelector('h1')?.textContent).toContain('내 정보')
    expect(el.querySelector('search')).toBeNull()
    expect(buttons(el)).not.toContain('회원 추가')
    expect(el.textContent).toContain('본인 정보만')
  })

  it('관리자는 회원 관리 (검색 / 회원 추가), 검색 안내는 부분 일치', async () => {
    mockFetch(list([admin, me]))
    login(admin)
    const el = await mount('/users', { '/users': UserListPage })
    expect(el.querySelector('h1')?.textContent).toContain('회원 관리')
    expect(buttons(el)).toContain('회원 추가')
    const input = el.querySelector<HTMLInputElement>('input[type="search"]')
    expect(input?.placeholder).toContain('부분 일치')
  })
})

describe('router: /users/new 는 관리자만', () => {
  it('관리자가 아니면 /users 로 보낸다', async () => {
    mockFetch({ body: { items: [], code: 'ok' } })
    login(me)
    await router.push('/users/new')
    expect(router.currentRoute.value.fullPath).toBe('/users')
  })

  it('관리자는 들어간다', async () => {
    login(admin)
    await router.push('/users/new')
    expect(router.currentRoute.value.fullPath).toBe('/users/new')
    expect(router.currentRoute.value.matched[0].components?.default).toBe(
      UserWritePage,
    )
  })
})
