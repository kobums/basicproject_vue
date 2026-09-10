<script setup lang="ts">
import { useFeedbackStore } from '../stores/feedback'
import Toast from './Toast.vue'

// 앱 전역 토스트 알림. 페이지에서는 useFeedbackStore() 의 notify({ type, message, onClose }) 호출.
// onClose 는 토스트가 사라질 때(자동/수동) 한 번 실행된다(예: 목록으로 이동).
const feedback = useFeedbackStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <Toast
        v-for="t in feedback.toasts"
        :key="t.id"
        :item="t"
        @remove="feedback.remove"
      />
    </div>
  </Teleport>
</template>
