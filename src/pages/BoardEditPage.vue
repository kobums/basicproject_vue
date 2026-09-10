<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BoardForm, { type BoardFormValues } from '../components/BoardForm.vue'
import { useBoard } from '../composables/useBoard'
import { updateBoard } from '../api/boards'
import { HttpError } from '../api/client'
import { useFeedbackStore } from '../stores/feedback'

const route = useRoute()
const router = useRouter()
const { notify } = useFeedbackStore()

const boardId = computed(() => Number(route.params.id))
const { board, loading, error } = useBoard(boardId)

const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: BoardFormValues) {
  if (!values.content.trim()) {
    fieldErrors.value = { content: '내용을 입력하세요.' }
    return
  }
  submitting.value = true
  fieldErrors.value = {}
  try {
    // 이미지는 새로 선택한 경우에만 교체 (없으면 기존 이미지 유지)
    await updateBoard(boardId.value, {
      title: values.title,
      content: values.content,
      image: values.image,
    })
    notify({ type: 'success', message: '게시글이 수정되었습니다.' })
    router.push(`/boards/${boardId.value}`)
  } catch (e) {
    if (e instanceof HttpError && e.status === 400) {
      fieldErrors.value = e.fieldErrors
      notify({ type: 'error', message: '입력값을 확인해주세요.' })
    } else {
      notify({
        type: 'error',
        message: e instanceof Error ? e.message : '수정에 실패했습니다.',
      })
    }
    submitting.value = false
  }
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">{{ error }}</p>
  <section v-else-if="board" class="page">
    <h1>글 수정</h1>
    <BoardForm
      mode="edit"
      :initial-title="board.title ?? ''"
      :initial-content="board.content"
      :current-img-url="board.imgUrl"
      :submitting="submitting"
      :field-errors="fieldErrors"
      @submit="handleSubmit"
      @cancel="router.push(`/boards/${boardId}`)"
    />
  </section>
</template>
