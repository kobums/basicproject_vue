import { vi, type Mock } from 'vitest'

export interface Call {
  url: string
  method: string
  headers: Record<string, string>
  body: unknown
}

type Reply = { status?: number; body?: unknown }

/** fetch 를 가짜로 바꾼다. 응답은 순서대로 쓴다 (마지막 응답은 반복). */
export function mockFetch(...replies: Reply[]): { calls: Call[]; fn: Mock } {
  const calls: Call[] = []
  let i = 0
  const fn = vi.fn(async (url: string, init: RequestInit = {}) => {
    calls.push({
      url,
      method: init.method ?? 'GET',
      headers: (init.headers ?? {}) as Record<string, string>,
      body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
    })
    const reply = replies[Math.min(i++, replies.length - 1)] ?? {}
    const status = reply.status ?? 200
    let text = ''
    if (typeof reply.body === 'string') text = reply.body
    else if (reply.body !== undefined) text = JSON.stringify(reply.body)
    return new Response(text || null, { status })
  })
  vi.stubGlobal('fetch', fn)
  return { calls, fn }
}
