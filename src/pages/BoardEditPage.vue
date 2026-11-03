<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BoardForm, { type BoardFormValues } from '../components/BoardForm.vue'
import { useBoard } from '../composables/useBoard'
import type { UpdateBoardRequest } from '../types/board'
import { uploadImage } from '../api/upload'
import { errorMessage, fieldErrorsOf } from '../lib/errors'
import { imageUrl } from '../lib/format'
import { useFeedbackStore } from '../stores/feedback'
import { useAuthStore } from '../stores/auth'
import { isOwner } from '../lib/permissions'

const route = useRoute()
const router = useRouter()
const { notify } = useFeedbackStore()
const auth = useAuthStore()

const boardId = computed(() => Number(route.params.id))
// 조회와 저장은 따로 둔다 (저장 실패가 화면의 error 를 덮지 않도록).
const { item: board, loading, error, fetchOne } = useBoard()
const { update, loading: saving } = useBoard()

watch(boardId, (id) => void fetchOne(id), { immediate: true })

// 수정은 작성자만 된다 (백엔드도 거부한다). 남의 글이면 폼 대신 안내를 보여준다.
const canEdit = computed(() => isOwner(auth.user, board.value))

const uploading = ref(false)
const submitting = computed(() => uploading.value || saving.value)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: BoardFormValues) {
  if (!values.title.trim()) {
    fieldErrors.value = { title: '제목을 입력하세요.' }
    return
  }
  fieldErrors.value = {}

  // 보낸 필드만 바뀐다 (부분 수정). 이미지는 새로 고른 경우에만 업로드해서 바꾼다.
  const body: UpdateBoardRequest = {
    title: values.title,
    content: values.content,
  }
  if (values.image) {
    uploading.value = true
    try {
      body.img = (await uploadImage(values.image)).url
    } catch (e) {
      fieldErrors.value = {
        image: errorMessage(e, '이미지 업로드에 실패했습니다.'),
      }
      return
    } finally {
      uploading.value = false
    }
  }

  try {
    await update(boardId.value, body)
  } catch (e) {
    fieldErrors.value = fieldErrorsOf(e)
    notify({ type: 'error', message: errorMessage(e, '수정에 실패했습니다.') })
    return
  }
  notify({ type: 'success', message: '게시글이 수정되었습니다.' })
  router.push(`/boards/${boardId.value}`)
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">
    {{ errorMessage(error, '게시글을 불러오지 못했습니다.') }}
  </p>
  <p v-else-if="board && !canEdit" class="error page">
    작성자만 수정할 수 있습니다.
  </p>
  <section v-else-if="board" class="page">
    <h1>글 수정</h1>
    <BoardForm
      mode="edit"
      :initial-title="board.title"
      :initial-content="board.content ?? ''"
      :current-img-url="imageUrl(board.img)"
      :submitting="submitting"
      :field-errors="fieldErrors"
      @submit="handleSubmit"
      @cancel="router.push(`/boards/${boardId}`)"
    />
  </section>
  <p v-else class="muted page">게시글이 없습니다.</p>
</template>
