// 날짜 문자열 → "2026-06-28 13:46"
// gomachine 백엔드는 "yyyy-MM-dd HH:mm:ss" (Go / Rust / Spring 생성 코드), 예전 Spring DTO 는 ISO("2026-06-28T13:46:22.31") 를 준다.
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(value)
  if (m) return `${m[1]} ${m[2]}`
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 게시글 img 값 → <img src>. 절대 URL / "/" 로 시작하면 그대로, 아니면 업로드 파일 이름이라 /uploads/ 아래로 본다
// (basicproject_go 가 /uploads 로 정적 제공. dev 에서는 vite 프록시가 백엔드로 넘긴다).
export function imageUrl(img: string | null | undefined): string | null {
  if (!img) return null
  if (
    /^(https?:)?\/\//.test(img) ||
    img.startsWith('/') ||
    img.startsWith('data:')
  ) {
    return img
  }
  return `/uploads/${img}`
}
