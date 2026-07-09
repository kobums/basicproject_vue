<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import { deleteUser } from '../api/users'
import { formatDateTime } from '../lib/format'
import ConfirmModal from '../components/ConfirmModal.vue'
import DescriptionList from '../components/DescriptionList.vue'
import { useFeedback } from '../stores/feedback'

const route = useRoute()
const router = useRouter()
const notify = useFeedback()

const userId = computed(() => Number(route.params.id))
const { user, loading, error } = useUser(userId)

const confirmOpen = ref(false)
const deleting = ref(false)

async function handleDelete() {
  deleting.value = true
  try {
    await deleteUser(userId.value)
    confirmOpen.value = false
    notify({ type: 'success', message: '회원이 삭제되었습니다.' })
    router.push('/users')
  } catch (e) {
    deleting.value = false
    confirmOpen.value = false
    notify({
      type: 'error',
      message: e instanceof Error ? e.message : '삭제에 실패했습니다.',
    })
  }
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">{{ error }}</p>
  <section v-else-if="user" class="page user-detail">
    <h1>{{ user.name ?? `#${user.id}` }}</h1>
    <DescriptionList
      :items="[
        { label: '이메일', value: user.email },
        { label: '이름', value: user.name ?? '-' },
        { label: '가입일', value: formatDateTime(user.createdAt) },
      ]"
    />

    <div class="board-form-actions">
      <RouterLink class="btn" to="/users">목록</RouterLink>
      <RouterLink class="btn" :to="`/users/${user.id}/edit`">수정</RouterLink>
      <button
        type="button"
        class="btn btn-danger"
        :disabled="deleting"
        @click="confirmOpen = true"
      >
        삭제
      </button>
    </div>

    <ConfirmModal
      :open="confirmOpen"
      title="회원 삭제"
      danger
      :busy="deleting"
      confirm-label="삭제"
      @close="confirmOpen = false"
      @confirm="handleDelete"
    >
      <b>{{ user.name ?? `#${user.id}` }}</b> ({{ user.email }}) 회원을
      삭제하시겠습니까?
    </ConfirmModal>
  </section>
</template>
