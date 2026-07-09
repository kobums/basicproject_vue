<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoard } from '../composables/useBoard'
import { deleteBoard } from '../api/boards'
import { formatDateTime } from '../lib/format'
import ConfirmModal from '../components/ConfirmModal.vue'
import ImageLightbox from '../components/ImageLightbox.vue'
import { useFeedback } from '../stores/feedback'

const route = useRoute()
const router = useRouter()
const notify = useFeedback()

const boardId = computed(() => Number(route.params.id))
const { board, loading, error } = useBoard(boardId)

const confirmOpen = ref(false)
const deleting = ref(false)

async function handleDelete() {
  deleting.value = true
  try {
    await deleteBoard(boardId.value)
    confirmOpen.value = false
    notify({ type: 'success', message: '게시글이 삭제되었습니다.' })
    router.push('/')
  } catch (e) {
    deleting.value = false
    confirmOpen.value = false
    notify({
      type: 'error',
      message: e instanceof Error ? e.message : '삭제에 실패했습니다.',
    })
  }
}
</script>

<template>
  <p v-if="loading" class="muted page">불러오는 중…</p>
  <p v-else-if="error" class="error page">{{ error }}</p>
  <section v-else-if="board" class="page board-detail">
    <h1>{{ board.title ?? '(제목 없음)' }}</h1>
    <div class="board-meta">
      <span>작성자 {{ board.author.name ?? `#${board.author.id}` }}</span>
      <span>{{ formatDateTime(board.createdAt) }}</span>
    </div>

    <ImageLightbox
      v-if="board.imgUrl"
      img-class="board-image"
      :src="board.imgUrl"
      :alt="board.title ?? '게시글 이미지'"
    />

    <article class="board-content">{{ board.content }}</article>

    <div class="board-form-actions">
      <RouterLink class="btn" to="/">목록</RouterLink>
      <RouterLink class="btn" :to="`/boards/${board.id}/edit`">수정</RouterLink>
      <button
        type="button"
        class="btn btn-danger"
        :disabled="deleting"
        @click="confirmOpen = true"
      >
        삭제
      </button>
    </div>

    <ConfirmModal
      :open="confirmOpen"
      title="게시글 삭제"
      danger
      :busy="deleting"
      confirm-label="삭제"
      @close="confirmOpen = false"
      @confirm="handleDelete"
    >
      이 게시글을 정말 삭제하시겠습니까?
    </ConfirmModal>
  </section>
</template>
