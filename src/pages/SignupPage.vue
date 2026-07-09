<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserForm, { type UserFormValues } from '../components/UserForm.vue'
import { signup } from '../api/auth'
import { HttpError } from '../api/client'
import { useAuth } from '../stores/auth'
import { useFeedback } from '../stores/feedback'

const router = useRouter()
const notify = useFeedback()
const { setSession } = useAuth()

const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: UserFormValues) {
  submitting.value = true
  fieldErrors.value = {}
  try {
    const res = await signup(values)
    // 가입 즉시 로그인 상태로 전환하고 홈으로 이동
    setSession(res.token, res.user)
    notify({ type: 'success', message: '가입이 완료되었습니다.' })
    router.replace('/')
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
