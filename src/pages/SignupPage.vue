<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserForm, { type UserFormValues } from '../components/UserForm.vue'
import { errorMessage, fieldErrorsOf } from '../lib/errors'
import { useAuthStore } from '../stores/auth'
import { useFeedbackStore } from '../stores/feedback'

const router = useRouter()
const { notify } = useFeedbackStore()
const auth = useAuthStore()

const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: UserFormValues) {
  submitting.value = true
  fieldErrors.value = {}
  try {
    // 가입 즉시 로그인 상태로 전환하고 홈으로 이동 (POST /api/auth/signup → { token, user? })
    await auth.signup(values)
    notify({ type: 'success', message: '가입이 완료되었습니다.' })
    router.replace('/')
  } catch (e) {
    fieldErrors.value = fieldErrorsOf(e)
    const hasField = Object.keys(fieldErrors.value).length > 0
    notify({
      type: 'error',
      message: hasField
        ? '입력값을 확인해주세요.'
        : errorMessage(e, '가입에 실패했습니다.'),
    })
    submitting.value = false
  }
}
</script>

<template>
  <section class="page">
    <h1>회원가입</h1>
    <UserForm
      mode="create"
      :submitting="submitting"
      :field-errors="fieldErrors"
      @submit="handleSubmit"
      @cancel="router.push('/login')"
    />
  </section>
</template>
