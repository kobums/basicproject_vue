// 이미지 업로드 (손으로 만든 파일). gomachine "인증 API 계약":
//
//   POST /api/upload/index  multipart (파일 필드 이름 upload)  → 200 { filename, url }  (실패 400 / 401)
//
// 게시글 img 컬럼에는 url (예: /uploads/abc.png) 을 저장한다. 게시글은 이미지 없이도 저장할 수 있다.
import { post } from '../services/api'

export const UPLOAD_PATH = '/upload/index'

export interface UploadResult {
  /** 서버가 저장한 파일 이름 */
  filename: string
  /** 브라우저에서 열 수 있는 주소. img 컬럼에 이 값을 넣는다. */
  url: string
}

export function parseUploadResponse(data: unknown): UploadResult {
  const obj = (typeof data === 'object' && data !== null ? data : {}) as {
    filename?: unknown
    url?: unknown
  }
  if (typeof obj.url !== 'string' || obj.url === '') {
    throw new Error('업로드 응답에 url 이 없습니다.')
  }
  return {
    filename: typeof obj.filename === 'string' ? obj.filename : '',
    url: obj.url,
  }
}

/** 파일을 올리고 { filename, url } 을 돌려준다. */
export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('upload', file)
  const res = await post<unknown>(UPLOAD_PATH, form)
  return parseUploadResponse(res.data)
}
