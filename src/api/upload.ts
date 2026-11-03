// 이미지 업로드 (손으로 만든 파일). 게시글 img 컬럼에 넣을 파일 이름을 받는다.
//
//   POST /api/upload/index  multipart (파일 필드 이름 upload)  → { filename, original, code }   (basicproject_go)
//
// 업로드는 gomachine HTTP 계약 밖이라 백엔드마다 다를 수 있다. 응답의 filename | url | path 를 읽고,
// 백엔드에 업로드 경로가 없으면(404 등) 던진다. 게시글은 이미지 없이도 저장할 수 있다.
import { post } from '../services/api'
import { checkGoError } from '../models/contract'

export const UPLOAD_PATH = '/upload/index'

export function parseUploadResponse(data: unknown): string {
  checkGoError(data)
  if (typeof data === 'string' && data !== '') return data
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    for (const key of ['filename', 'url', 'path']) {
      const value = obj[key]
      if (typeof value === 'string' && value !== '') return value
    }
  }
  throw new Error('업로드 응답에 파일 이름이 없습니다.')
}

/** 파일을 올리고 img 컬럼에 저장할 값(서버가 정한 파일 이름 / 경로)을 돌려준다. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('upload', file)
  const res = await post<unknown>(UPLOAD_PATH, form)
  return parseUploadResponse(res.data)
}
