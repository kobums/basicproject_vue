<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BoardForm, { type BoardFormValues } from '../components/BoardForm.vue'
import { useBoard } from '../composables/useBoard'
import { uploadImage } from '../api/upload'
import { errorMessage, fieldErrorsOf } from '../lib/errors'
import { useFeedbackStore } from '../stores/feedback'

const router = useRouter()
const { notify } = useFeedbackStore()
const { create, loading, error } = useBoard()

const uploading = ref(false)
const submitting = computed(() => uploading.value || loading.value)
const fieldErrors = ref<Record<string, string>>({})

async function handleSubmit(values: BoardFormValues) {
  // 작성자(user)는 보내지 않는다: 백엔드가 로그인 세션으로 채운다 (model.json session).
  if (!values.title.trim()) {
    fieldErrors.value = { title: '제목을 입력하세요.' }
    return
  }
  fieldErrors.value = {}

  // 이미지는 먼저 업로드해서 받은 파일 이름을 img 컬럼에 넣는다 (선택값).
  let img: string | null = null
  if (values.image) {
    uploading.value = true
    try {
      img = await uploadImage(values.image)
    } catch (e) {
      fieldErrors.value = {
        image: errorMessage(e, '이미지 업로드에 실패했습니다.'),
      }
      return
    } finally {
      uploading.value = false
    }
  }

  const created = await create({
    title: values.title,
    content: values.content,
    img,
  })
  if (error.value) {
    fieldErrors.value = fieldErrorsOf(error.value)
    notify({
      type: 'error',
      message: errorMessage(error.value, '등록에 실패했습니다.'),
    })
    return
  }
  notify({ type: 'success', message: '게시글이 등록되었습니다.' })
  // Spring 은 저장한 엔티티, Go 는 {id} 를 돌려준다. 어느 쪽이든 id 가 있다.
  router.push(created?.id ? `/boards/${created.id}` : '/')
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
