<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoard } from '../composables/useBoard'
import { formatDateTime, imageUrl } from '../lib/format'
import { errorMessage } from '../lib/errors'
import ConfirmModal from '../components/ConfirmModal.vue'
import ImageLightbox from '../components/ImageLightbox.vue'
import { useFeedbackStore } from '../stores/feedback'

const route = useRoute()
const router = useRouter()
const { notify } = useFeedbackStore()

const boardId = computed(() => Number(route.params.id))
// 조회와 삭제는 따로 둔다 (삭제 실패가 상세 화면의 error 를 덮지 않도록).
const { item: board, loading, error, fetchOne } = useBoard()
const { remove, loading: removing, error: removeError } = useBoard()

watch(boardId, (id) => void fetchOne(id), { immediate: true })

const imgSrc = computed(() => imageUrl(board.value?.img))

const confirmOpen = ref(false)

async function handleDelete() {
  await remove(boardId.value)
  confirmOpen.value = false
  if (removeError.value) {
    notify({
      type: 'error',
      message: errorMessage(removeError.value, '삭제에 실패했습니다.'),
    })
    return
  }
  notify({ type: 'success', message: '게시글이 삭제되었습니다.' })
  router.push('/')
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">
    {{ errorMessage(error, '게시글을 불러오지 못했습니다.') }}
  </p>
  <section v-else-if="board" class="page board-detail">
    <h1>{{ board.title || '(제목 없음)' }}</h1>
    <div class="board-meta">
      <span>작성자 {{ board.extra?.user?.name || `#${board.user}` }}</span>
      <span>{{ formatDateTime(board.createddate) }}</span>
    </div>

    <ImageLightbox
      v-if="imgSrc"
      img-class="board-image"
      :src="imgSrc"
      :alt="board.title || '게시글 이미지'"
    />

    <article class="board-content">{{ board.content }}</article>

    <div class="board-form-actions">
      <RouterLink class="btn" to="/">목록</RouterLink>
      <RouterLink class="btn" :to="`/boards/${board.id}/edit`">수정</RouterLink>
      <button
        type="button"
        class="btn btn-danger"
        :disabled="removing"
        @click="confirmOpen = true"
      >
        삭제
      </button>
    </div>

    <ConfirmModal
      :open="confirmOpen"
      title="게시글 삭제"
      danger
      :busy="removing"
      confirm-label="삭제"
      @close="confirmOpen = false"
      @confirm="handleDelete"
    >
      이 게시글을 정말 삭제하시겠습니까?
    </ConfirmModal>
  </section>
  <p v-else class="muted page">게시글이 없습니다.</p>
</template>
