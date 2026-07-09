import { ref, watch } from 'vue'
import { fetchBoards } from '../api/boards'
import type { Board, BoardSearch, PageResponse } from '../types/board'

// 목록 + 페이징 + 검색 상태를 캡슐화한 composable.
// ref / watch 의 협업을 연습하는 예제 (React 버전의 useBoards 훅과 대응).
const EMPTY_SEARCH: BoardSearch = { type: 'title', keyword: '' }

export function useBoards(initialPage = 0, initialSize = 10) {
  const page = ref(initialPage)
  const size = ref(initialSize)
  // 실제로 조회에 반영된(=커밋된) 검색 조건. 입력 중인 값은 SearchBar 가 따로 관리.
  const search = ref<BoardSearch>({ ...EMPTY_SEARCH })
  const data = ref<PageResponse<Board> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 요청 순번. 조건이 연달아 바뀔 때(검색 직후 등) 이전 요청의 늦은 응답이
  // 최신 결과를 덮어쓰지 않도록 마지막 요청만 상태에 반영한다.
  let requestSeq = 0

  async function load() {
    const seq = ++requestSeq
    loading.value = true
    error.value = null
    try {
      const res = await fetchBoards(page.value, search.value, size.value)
      if (seq === requestSeq) data.value = res
    } catch (e) {
      if (seq === requestSeq)
        error.value =
          e instanceof Error ? e.message : '목록을 불러오지 못했습니다.'
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  // page/size/search 가 바뀔 때마다 재조회. 같은 틱의 변경(검색+페이지 리셋)은 한 번으로 합쳐진다.
  watch([page, size, search], () => void load(), { immediate: true })

  // 검색 실행: 조건을 커밋하고 항상 첫 페이지부터 다시 조회.
  function submitSearch(next: BoardSearch) {
    search.value = next
    page.value = 0
  }

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
    search,
    submitSearch,
    reload: load,
  }
}
