import { computed, ref } from 'vue'

// 앱 전역 로딩 카운트. 여러 요청이 겹쳐도 마지막 hide 에서만 오버레이가 사라진다.
const count = ref(0)

export const loadingVisible = computed(() => count.value > 0)

export function useLoading() {
  const show = () => {
    count.value += 1
  }
  const hide = () => {
    count.value = Math.max(0, count.value - 1)
  }
  return { show, hide }
}
