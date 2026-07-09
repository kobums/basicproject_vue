import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { fetchBoard } from '../api/boards'
import type { Board } from '../types/board'

// 단일 게시글 조회 composable. id 가 바뀌면 다시 불러온다.
// id 변경/언마운트 시 stale 응답이 상태를 덮어쓰지 않도록 onCleanup 으로 cancelled 플래그 사용.
export function useBoard(id: MaybeRefOrGetter<number>) {
  const board = ref<Board | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  watch(
    () => toValue(id),
    (boardId, _prev, onCleanup) => {
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })

      loading.value = true
      error.value = null

      fetchBoard(boardId)
        .then((b) => {
          if (!cancelled) board.value = b
        })
        .catch((e: unknown) => {
          if (!cancelled)
            error.value =
              e instanceof Error ? e.message : '게시글을 불러오지 못했습니다.'
        })
        .finally(() => {
          if (!cancelled) loading.value = false
        })
    },
    { immediate: true },
  )

  return { board, loading, error }
}
