<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserForm, { type UserFormValues } from '../components/UserForm.vue'
import { useUser } from '../composables/useUser'
import type { CreateUserRequest } from '../types/user'
import { errorMessage, fieldErrorsOf } from '../lib/errors'
import { useFeedbackStore } from '../stores/feedback'

const router = useRouter()
const { notify } = useFeedbackStore()
const { create, loading: submitting } = useUser()

const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: UserFormValues) {
  fieldErrors.value = {}
  // 관리자 화면 (라우터 meta.requiresAdmin). 생성 API(POST /api/user)는 비밀번호 컬럼 passwd 를 받아 백엔드가 해시한다.
  // CreateUserRequest 에는 서버가 정하는 level(보호 컬럼, DB 기본값) / createddate 가 없다.
  const body: CreateUserRequest = {
    email: values.email,
    name: values.name,
    passwd: values.password,
  }
  try {
    await create(body)
  } catch (e) {
    fieldErrors.value = fieldErrorsOf(e)
    notify({ type: 'error', message: errorMessage(e, '등록에 실패했습니다.') })
    return
  }
  notify({ type: 'success', message: '회원이 등록되었습니다.' })
  router.push('/users')
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
