<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BoardForm, { type BoardFormValues } from '../components/BoardForm.vue'
import { createBoard } from '../api/boards'
import { HttpError } from '../api/client'
import { useFeedbackStore } from '../stores/feedback'

const router = useRouter()
const { notify } = useFeedbackStore()

const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: BoardFormValues) {
  // 작성자는 로그인 사용자(JWT)에서, 이미지는 선택값. 내용만 필수 확인.
  if (!values.content.trim()) {
    fieldErrors.value = { content: '내용을 입력하세요.' }
    return
  }

  submitting.value = true
  fieldErrors.value = {}
  try {
    const created = await createBoard({
      title: values.title,
      content: values.content,
      image: values.image,
    })
    notify({ type: 'success', message: '게시글이 등록되었습니다.' })
    router.push(`/boards/${created.id}`)
  } catch (e) {
    if (e instanceof HttpError && e.status === 400) {
      fieldErrors.value = e.fieldErrors
      notify({ type: 'error', message: '입력값을 확인해주세요.' })
    } else {
      notify({
        type: 'error',
        message: e instanceof Error ? e.message : '등록에 실패했습니다.',
      })
    }
    submitting.value = false
  }
}
</script>

<template>
  <section class="page">
    <h1>글쓰기</h1>
    <BoardForm
      mode="create"
      :submitting="submitting"
      :field-errors="fieldErrors"
      @submit="handleSubmit"
      @cancel="router.push('/')"
    />
  </section>
</template>
