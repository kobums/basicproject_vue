import { ref, watch } from 'vue'
import { fetchUsers } from '../api/users'
import type { PageResponse, User } from '../types/user'

export function useUsers(initialPage = 0, initialSize = 10) {
  const page = ref(initialPage)
  const size = ref(initialSize)
  // keyword: 입력값(즉시 반영), debouncedKeyword: 실제 조회에 쓰이는 값
  const keyword = ref('')
  const debouncedKeyword = ref('')
  const data = ref<PageResponse<User> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 입력이 멈춘 뒤 300ms 후에만 조회어를 갱신(타이핑마다 요청 폭주 방지).
  // 검색어가 바뀌면 첫 페이지부터 다시 본다 → page 0 도 함께 커밋해 중복 조회 방지.
  watch(keyword, (next, _prev, onCleanup) => {
    const timer = setTimeout(() => {
      debouncedKeyword.value = next
      page.value = 0
    }, 300)
    onCleanup(() => clearTimeout(timer))
  })

  // 요청 순번. 이전 요청의 늦은 응답이 최신 결과를 덮어쓰지 않도록 가드.
  let requestSeq = 0

  async function load() {
    const seq = ++requestSeq
    loading.value = true
    error.value = null
    try {
      const res = await fetchUsers(
        page.value,
        debouncedKeyword.value,
        size.value,
      )
      if (seq === requestSeq) data.value = res
    } catch (e) {
      if (seq === requestSeq)
        error.value =
          e instanceof Error ? e.message : '회원 목록을 불러오지 못했습니다.'
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  watch([page, size, debouncedKeyword], () => void load(), { immediate: true })

  // 페이지 크기 변경: 첫 페이지부터 다시 조회.
  function changeSize(next: number) {
    size.value = next
    page.value = 0
  }

  function setPage(next: number) {
    page.value = next
  }

  return {
    data,
    loading,
    error,
    page,
    setPage,
    size,
    changeSize,
    keyword,
    reload: load,
  }
}
