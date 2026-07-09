<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import type { FeedbackType, ToastItem } from '../stores/feedback'

const props = defineProps<{ item: ToastItem }>()
const emit = defineEmits<{ remove: [id: number] }>()

// 타입별 자동 사라짐 시간(ms). 성공은 짧게, 오류는 충분히 읽을 시간을 준다.
const AUTO_DISMISS_MS: Record<FeedbackType, number> = {
  success: 2000,
  error: 5000,
}

// 자동 타이머와 수동 닫기가 겹쳐도 onClose 가 두 번 실행되지 않도록 가드
let finished = false
let timer: ReturnType<typeof setTimeout> | undefined

function finish() {
  if (finished) return
  finished = true
  props.item.onClose?.()
  emit('remove', props.item.id)
}

onMounted(() => {
  timer = setTimeout(finish, AUTO_DISMISS_MS[props.item.type])
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <output :class="`toast toast-${item.type}`" aria-label="알림">
    <span class="toast-icon" aria-hidden="true">
      {{ item.type === 'success' ? '✓' : '!' }}
    </span>
    <div class="toast-body">
      <strong v-if="item.title" class="toast-title">{{ item.title }}</strong>
      <p class="toast-message">{{ item.message }}</p>
    </div>
    <button type="button" class="toast-close" aria-label="닫기" @click="finish">
      <span aria-hidden="true">×</span>
    </button>
  </output>
</template>
