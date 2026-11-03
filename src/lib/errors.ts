// 화면에 보여줄 에러 문구. services/api.ts 의 HttpError (Spring 등 HTTP 상태 코드 에러)와
// models/contract.ts 의 ApiError (Go 의 HTTP 200 + code 에러)를 같이 다룬다.
import { HttpError } from '../services/api'
import { ApiError } from '../models/contract'

const API_ERROR_MESSAGES: Record<string, string> = {
  'auth error': '권한이 없습니다. 로그인했는지, 본인 데이터인지 확인하세요.',
  'bad request': '잘못된 요청입니다.',
}

export function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return API_ERROR_MESSAGES[e.code] ?? fallback
  if (e instanceof HttpError) {
    if (e.status === 401) return '로그인이 필요합니다.'
    if (e.status === 403) return '권한이 없습니다.'
    if (e.status === 404) return '찾을 수 없습니다.'
    return e.message || fallback
  }
  if (e instanceof Error && e.message) return e.message
  return fallback
}

/**
 * 400 응답의 필드별 에러 (Spring / basicproject_go 인증 라우트의 fieldErrors). 없으면 {}.
 * 생성 API 의 비밀번호 컬럼 이름(passwd)은 폼 필드 이름(password)으로도 넣는다.
 */
export function fieldErrorsOf(e: unknown): Record<string, string> {
  if (!(e instanceof HttpError) || e.status !== 400) return {}
  const fields = { ...e.fieldErrors }
  if (fields.passwd && !fields.password) fields.password = fields.passwd
  return fields
}
