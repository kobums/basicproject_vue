import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { fetchUser } from '../api/users'
import type { User } from '../types/user'

export function useUser(id: MaybeRefOrGetter<number>) {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  watch(
    () => toValue(id),
    (userId, _prev, onCleanup) => {
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })

      loading.value = true
      error.value = null

      fetchUser(userId)
        .then((u) => {
          if (!cancelled) user.value = u
        })
        .catch((e: unknown) => {
          if (!cancelled)
            error.value =
              e instanceof Error
                ? e.message
                : '회원 정보를 불러오지 못했습니다.'
        })
        .finally(() => {
          if (!cancelled) loading.value = false
        })
    },
    { immediate: true },
  )

  return { user, loading, error }
}
