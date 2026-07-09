<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../api/auth'
import { HttpError } from '../api/client'
import BaseInput from '../components/BaseInput.vue'
import { useAuth } from '../stores/auth'
import { useFeedback } from '../stores/feedback'

const route = useRoute()
const router = useRouter()
const notify = useFeedback()
const { setSession } = useAuth()

const email = ref('')
const password = ref('')
const submitting = ref(false)

// 로그인 후 원래 가려던 페이지로 복귀 (없으면 홈). 라우터 가드가 redirect 쿼리에 담아준다.
const from =
  typeof route.query.redirect === 'string' ? route.query.redirect : '/'

async function handleSubmit() {
  submitting.value = true
  try {
    const res = await login({ email: email.value, password: password.value })
    setSession(res.token, res.user)
    router.replace(from)
  } catch (err) {
    notify({
      type: 'error',
      message:
        err instanceof HttpError ? err.message : '로그인에 실패했습니다.',
    })
    submitting.value = false
  }
}
</script>

<template>
  <section class="page">
    <h1>로그인</h1>
    <form class="board-form" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="email"
        label="이메일"
        type="email"
        placeholder="user@example.com"
        required
      />

      <BaseInput
        v-model="password"
        label="비밀번호"
        type="password"
        placeholder="비밀번호"
        required
      />

      <div class="board-form-actions">
        <RouterLink class="btn" to="/signup">회원가입</RouterLink>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '로그인 중…' : '로그인' }}
        </button>
      </div>
    </form>
  </section>
</template>
