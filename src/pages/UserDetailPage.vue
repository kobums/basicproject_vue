<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import { formatDateTime } from '../lib/format'
import { errorMessage } from '../lib/errors'
import ConfirmModal from '../components/ConfirmModal.vue'
import DescriptionList from '../components/DescriptionList.vue'
import { useFeedbackStore } from '../stores/feedback'

const route = useRoute()
const router = useRouter()
const { notify } = useFeedbackStore()

const userId = computed(() => Number(route.params.id))
// 조회와 삭제는 따로 둔다. 회원 수정/삭제는 본인(또는 adminLevel 이상)만 된다.
const { item: user, loading, error, fetchOne } = useUser()
const { remove, loading: removing, error: removeError } = useUser()

watch(userId, (id) => void fetchOne(id), { immediate: true })

const confirmOpen = ref(false)

async function handleDelete() {
  await remove(userId.value)
  confirmOpen.value = false
  if (removeError.value) {
    notify({
      type: 'error',
      message: errorMessage(removeError.value, '삭제에 실패했습니다.'),
    })
    return
  }
  notify({ type: 'success', message: '회원이 삭제되었습니다.' })
  router.push('/users')
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">
    {{ errorMessage(error, '회원 정보를 불러오지 못했습니다.') }}
  </p>
  <section v-else-if="user" class="page user-detail">
    <h1>{{ user.name || `#${user.id}` }}</h1>
    <DescriptionList
      :items="[
        { label: '이메일', value: user.email },
        { label: '이름', value: user.name || '-' },
        { label: '가입일', value: formatDateTime(user.createddate) },
      ]"
    />

    <div class="board-form-actions">
      <RouterLink class="btn" to="/users">목록</RouterLink>
      <RouterLink class="btn" :to="`/users/${user.id}/edit`">수정</RouterLink>
      <button
        type="button"
        class="btn btn-danger"
        :disabled="removing"
        @click="confirmOpen = true"
      >
        삭제
      </button>
    </div>

    <ConfirmModal
      :open="confirmOpen"
      title="회원 삭제"
      danger
      :busy="removing"
      confirm-label="삭제"
      @close="confirmOpen = false"
      @confirm="handleDelete"
    >
      <b>{{ user.name || `#${user.id}` }}</b> ({{ user.email }}) 회원을
      삭제하시겠습니까?
    </ConfirmModal>
  </section>
  <p v-else class="muted page">회원이 없습니다.</p>
</template>
