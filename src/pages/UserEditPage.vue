<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserForm, { type UserFormValues } from '../components/UserForm.vue'
import { useUser } from '../composables/useUser'
import type { UpdateUserRequest } from '../types/user'
import { errorMessage, fieldErrorsOf } from '../lib/errors'
import { useFeedbackStore } from '../stores/feedback'

const route = useRoute()
const router = useRouter()
const { notify } = useFeedbackStore()

const userId = computed(() => Number(route.params.id))
const { item: user, loading, error, fetchOne } = useUser()
const { update, loading: submitting, error: saveError } = useUser()

watch(userId, (id) => void fetchOne(id), { immediate: true })

const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: UserFormValues) {
  fieldErrors.value = {}
  // 이메일은 바꾸지 않는다. 비밀번호(passwd)는 입력했을 때만 보낸다 (비우면 기존 값 유지).
  const body: UpdateUserRequest = { name: values.name }
  if (values.password) body.passwd = values.password
  await update(userId.value, body)
  if (saveError.value) {
    fieldErrors.value = fieldErrorsOf(saveError.value)
    notify({
      type: 'error',
      message: errorMessage(saveError.value, '수정에 실패했습니다.'),
    })
    return
  }
  notify({ type: 'success', message: '회원 정보가 수정되었습니다.' })
  router.push(`/users/${userId.value}`)
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">
    {{ errorMessage(error, '회원 정보를 불러오지 못했습니다.') }}
  </p>
  <section v-else-if="user" class="page">
    <h1>회원 수정</h1>
    <UserForm
      mode="edit"
      :initial-email="user.email"
      :initial-name="user.name"
      :submitting="submitting"
      :field-errors="fieldErrors"
      @submit="handleSubmit"
      @cancel="router.push(`/users/${userId}`)"
    />
  </section>
  <p v-else class="muted page">회원이 없습니다.</p>
</template>
