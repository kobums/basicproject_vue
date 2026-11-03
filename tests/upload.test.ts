// 업로드 계약: POST /api/upload/index (multipart, 필드 upload) → {filename, url}. img 컬럼에는 url 을 넣는다.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseUploadResponse, uploadImage } from '../src/api/upload'
import { HttpError } from '../src/services/api'
import { imageUrl } from '../src/lib/format'
import { mockFetch } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('upload', () => {
  it('multipart upload 필드로 보내고 {filename, url} 을 돌려준다', async () => {
    const { calls } = mockFetch({
      body: { filename: 'abc.png', url: '/uploads/abc.png' },
    })
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    const res = await uploadImage(file)
    expect(res).toEqual({ filename: 'abc.png', url: '/uploads/abc.png' })
    expect(calls[0].method).toBe('POST')
    expect(calls[0].url).toBe('/api/upload/index')
    expect(calls[0].body).toBeInstanceOf(FormData)
    expect((calls[0].body as FormData).get('upload')).toBeInstanceOf(File)
    // img 에 저장한 url 은 그대로 <img src> 가 된다
    expect(imageUrl(res.url)).toBe('/uploads/abc.png')
  })

  it('url 이 없으면 던진다 (filename 만으로는 안 된다)', () => {
    expect(() => parseUploadResponse({ filename: 'abc.png' })).toThrow('url')
    expect(() => parseUploadResponse(null)).toThrow('url')
  })

  it('400 / 401 은 HttpError', async () => {
    mockFetch({ status: 400, body: { status: 400, message: '파일 없음' } })
    const file = new File(['x'], 'a.png')
    await expect(uploadImage(file)).rejects.toBeInstanceOf(HttpError)
  })
})
