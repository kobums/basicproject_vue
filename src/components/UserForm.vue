<script lang="ts">
// 폼 제출 값 타입. <script setup> 은 export 를 허용하지 않아 일반 script 블록에서 내보낸다.
export interface UserFormValues {
  email: string
  name: string
  password: string
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseInput from './BaseInput.vue'

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'edit'
    initialEmail?: string
    initialName?: string
    submitting: boolean
    fieldErrors?: Record<string, string>
  }>(),
  {
    initialEmail: '',
    initialName: '',
    fieldErrors: () => ({}),
  },
)

const emit = defineEmits<{ submit: [values: UserFormValues]; cancel: [] }>()

const email = ref(props.initialEmail)
const name = ref(props.initialName)
const password = ref('')

function handleSubmit() {
  emit('submit', {
    email: email.value,
    name: name.value,
    password: password.value,
  })
}

// 중첩 삼항을 피하려 제출 버튼 라벨을 미리 계산
const actionLabel = computed(() => (props.mode === 'create' ? '가입' : '수정'))
</script>

<template>
  <form class="board-form" @submit.prevent="handleSubmit">
    <!-- 이메일은 가입 시에만 입력 (수정 화면에서는 변경하지 않음) -->
    <BaseInput
      v-model="email"
      label="이메일"
      type="email"
      placeholder="user@example.com"
      :disabled="mode === 'edit'"
      :error="fieldErrors.email"
    />

    <BaseInput
      v-model="name"
      label="이름"
      placeholder="이름"
      :error="fieldErrors.name"
    />

    <BaseInput
      v-model="password"
      :label="`비밀번호${mode === 'edit' ? ' (변경 시에만 입력)' : ''}`"
      type="password"
      :placeholder="
        mode === 'edit' ? '비워두면 기존 비밀번호 유지' : '비밀번호'
      "
      :error="fieldErrors.password"
    />

    <div class="board-form-actions">
      <button
        type="button"
        class="btn"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        취소
      </button>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? '저장 중…' : actionLabel }}
      </button>
    </div>
  </form>
</template>
