// gomachine 이 한 번만 만드는 사용자 파일이다 (이미 있으면 덮어쓰지 않는다). 프로젝트에 맞게 고쳐 써도 된다.
// 생성 모델(models/*.ts)이 쓰는 axios 모양 fetch 래퍼: get / post / put / patch / del 은 { data, status } 를 돌려준다.
// 기본 주소는 VITE_API_BASE_URL (없으면 '/api'), 토큰은 setTokenProvider 로 바꿀 수 있다 (기본 localStorage 'token').
// HTTP 에러(2xx 아님)는 HttpError 로 던진다. Go 의 code 에러(HTTP 200)는 models/contract.ts 가 ApiError 로 던진다.
//
// 이 프로젝트의 유일한 HTTP 클라이언트다 (생성 모델 + 손으로 만든 src/api/auth.ts, src/api/upload.ts 가 같이 쓴다).
// 토큰과 401 처리는 stores/auth.ts 의 init() 이 앱 시작 때 setTokenProvider / setUnauthorizedHandler 로 한 번 연결한다.

export interface ApiResponse<T> {
  data: T
  status: number
}

export interface RequestConfig {
  params?: object
  data?: unknown
  headers?: Record<string, string>
}

export class HttpError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>
  readonly body: unknown

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
    body?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.body = body
  }
}

const env = (import.meta as { env?: Record<string, string | undefined> }).env
let baseUrl: string = env?.VITE_API_BASE_URL ?? '/api'

let tokenProvider: () => string | null = () =>
  typeof localStorage === 'undefined' ? null : localStorage.getItem('token')

let unauthorizedHandler: (() => void) | null = null

/** 요청 주소 앞부분 (기본 VITE_API_BASE_URL 또는 '/api'). */
export function setBaseUrl(url: string): void {
  baseUrl = url
}

/** Authorization: Bearer 에 쓸 토큰을 돌려주는 함수 (없으면 null). */
export function setTokenProvider(fn: () => string | null): void {
  tokenProvider = fn
}

/** 401 응답을 받았을 때 부를 함수 (예: 로그아웃 처리). */
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn
}

function query(params?: object): string {
  if (!params) return ''
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    q.append(key, String(value))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

function encodeBody(body: unknown): { payload?: BodyInit; isJson: boolean } {
  if (body === undefined) return { isJson: false }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    // 파일 업로드: 브라우저가 boundary 를 포함한 Content-Type 을 직접 넣는다.
    return { payload: body, isJson: false }
  }
  return { payload: JSON.stringify(body), isJson: true }
}

function parseBody(text: string): unknown {
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function toHttpError(status: number, data: unknown): HttpError {
  const err = (typeof data === 'object' && data !== null ? data : {}) as {
    message?: string
    code?: string
    error?: string
    fieldErrors?: Record<string, string>
  }
  return new HttpError(
    status,
    err.message ?? err.error ?? err.code ?? `HTTP ${status}`,
    err.fieldErrors ?? {},
    data,
  )
}

async function send<T>(
  method: string,
  url: string,
  body: unknown,
  cfg: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const { payload, isJson } = encodeBody(body)
  const token = tokenProvider()
  const res = await fetch(`${baseUrl}${url}${query(cfg.params)}`, {
    method,
    headers: {
      ...(isJson ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...cfg.headers,
    },
    body: payload,
  })
  const data = parseBody(await res.text())
  if (!res.ok) {
    if (res.status === 401) unauthorizedHandler?.()
    throw toHttpError(res.status, data)
  }
  return { data: data as T, status: res.status }
}

export const get = <T>(url: string, cfg?: RequestConfig) =>
  send<T>('GET', url, undefined, cfg)
export const post = <T>(url: string, body?: unknown, cfg?: RequestConfig) =>
  send<T>('POST', url, body, cfg)
export const put = <T>(url: string, body?: unknown, cfg?: RequestConfig) =>
  send<T>('PUT', url, body, cfg)
export const patch = <T>(url: string, body?: unknown, cfg?: RequestConfig) =>
  send<T>('PATCH', url, body, cfg)
export const del = <T>(url: string, cfg?: RequestConfig) =>
  send<T>('DELETE', url, cfg?.data, cfg)
