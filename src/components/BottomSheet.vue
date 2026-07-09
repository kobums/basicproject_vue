<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits<{ close: [] }>()

// 아래에서 올라오는 시트 (모바일 친화 오버레이). ESC/배경 클릭으로 닫힌다.
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

let prevOverflow = ''

watch(
  () => props.open,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onKeyDown)
      prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  if (props.open) document.body.style.overflow = prevOverflow
})
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <button
        type="button"
        class="sheet-backdrop"
        aria-label="닫기"
        @click="emit('close')"
      />
      <dialog class="bottom-sheet" open aria-modal="true" :aria-label="title">
        <span class="sheet-handle" aria-hidden="true" />
        <header class="sheet-header">
          <h2>{{ title }}</h2>
          <button
            type="button"
            class="modal-close"
            aria-label="닫기"
            @click="emit('close')"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="sheet-body"><slot /></div>
      </dialog>
    </template>
  </Teleport>
</template>
