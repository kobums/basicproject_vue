import { reactive } from 'vue'

export type FeedbackType = 'success' | 'error'

export interface FeedbackOptions {
  type: FeedbackType
  message: string
  title?: string
  onClose?: () => void // 토스트가 사라질 때 실행 (선택). 보통 이동은 notify 직후 router 이동으로 처리.
}

export interface ToastItem extends FeedbackOptions {
  id: number
}

// 앱 전역 토스트 목록. ToastStack.vue 가 렌더링하고, 페이지는 notify() 만 호출한다.
const toasts = reactive<ToastItem[]>([])
let nextId = 0

export function notify(options: FeedbackOptions): void {
  nextId += 1
  toasts.push({ ...options, id: nextId })
}

export function removeToast(id: number): void {
  const idx = toasts.findIndex((t) => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

// 성공/실패 피드백 토스트를 띄우는 함수를 반환하는 composable
export function useFeedback() {
  return notify
}

export function useToasts() {
  return toasts
}
