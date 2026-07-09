<script setup lang="ts">
import { removeToast, useToasts } from '../stores/feedback'
import Toast from './Toast.vue'

// 앱 전역 토스트 알림. 페이지에서는 useFeedback() 으로 notify({ type, message, onClose }) 호출.
// onClose 는 토스트가 사라질 때(자동/수동) 한 번 실행된다(예: 목록으로 이동).
const toasts = useToasts()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <Toast v-for="t in toasts" :key="t.id" :item="t" @remove="removeToast" />
    </div>
  </Teleport>
</template>
