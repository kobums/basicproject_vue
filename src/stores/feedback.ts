import { defineStore } from 'pinia'
import { ref } from 'vue'

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
export const useFeedbackStore = defineStore('feedback', () => {
  const toasts = ref<ToastItem[]>([])
  let nextId = 0

  function notify(options: FeedbackOptions): void {
    nextId += 1
    toasts.value.push({ ...options, id: nextId })
  }

  function remove(id: number): void {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return { toasts, notify, remove }
})
