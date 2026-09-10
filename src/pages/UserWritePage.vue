<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserForm, { type UserFormValues } from '../components/UserForm.vue'
import { createUser } from '../api/users'
import { HttpError } from '../api/client'
import { useFeedbackStore } from '../stores/feedback'

const router = useRouter()
const { notify } = useFeedbackStore()

const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: UserFormValues) {
  submitting.value = true
  fieldErrors.value = {}
  try {
    await createUser(values)
    notify({ type: 'success', message: '회원이 등록되었습니다.' })
    router.push('/users')
  } catch (e) {
    if (e instanceof HttpError && e.status === 400) {
      fieldErrors.value = e.fieldErrors
      const hasField = Object.keys(e.fieldErrors).length > 0
      notify({
        type: 'error',
        message: hasField ? '입력값을 확인해주세요.' : e.message,
      })
    } else {
      notify({
        type: 'error',
        message: e instanceof Error ? e.message : '가입에 실패했습니다.',
      })
    }
    submitting.value = false
  }
}
</script>

<template>
  <section class="page">
    <h1>회원 추가</h1>
    <UserForm
      mode="create"
      :submitting="submitting"
      :field-errors="fieldErrors"
      @submit="handleSubmit"
      @cancel="router.push('/users')"
    />
  </section>
</template>
