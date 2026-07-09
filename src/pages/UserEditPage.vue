<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserForm, { type UserFormValues } from '../components/UserForm.vue'
import { useUser } from '../composables/useUser'
import { updateUser } from '../api/users'
import { HttpError } from '../api/client'

const route = useRoute()
const router = useRouter()

const userId = computed(() => Number(route.params.id))
const { user, loading, error } = useUser(userId)

const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: UserFormValues) {
  submitting.value = true
  fieldErrors.value = {}
  try {
    // 이메일은 변경하지 않음. 비밀번호는 비우면 기존 값 유지.
    await updateUser(userId.value, {
      name: values.name,
      password: values.password,
    })
    router.push('/users')
  } catch (e) {
    if (e instanceof HttpError && e.status === 400) {
      fieldErrors.value = e.fieldErrors
    } else {
      alert(e instanceof Error ? e.message : '수정에 실패했습니다.')
    }
    submitting.value = false
  }
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">{{ error }}</p>
  <section v-else-if="user" class="page">
    <h1>회원 수정</h1>
    <UserForm
      mode="edit"
      :initial-email="user.email"
      :initial-name="user.name ?? ''"
      :submitting="submitting"
      :field-errors="fieldErrors"
      @submit="handleSubmit"
      @cancel="router.push('/users')"
    />
  </section>
</template>
