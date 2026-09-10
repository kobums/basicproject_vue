import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 앱 전역 로딩 카운트. 여러 요청이 겹쳐도 마지막 hide 에서만 오버레이가 사라진다.
export const useLoadingStore = defineStore('loading', () => {
  const count = ref(0)

  const visible = computed(() => count.value > 0)

  function show(): void {
    count.value += 1
  }

  function hide(): void {
    count.value = Math.max(0, count.value - 1)
  }

  return { count, visible, show, hide }
})
