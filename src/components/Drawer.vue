<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits<{ close: [] }>()

// 오른쪽에서 슬라이드되어 나오는 사이드 패널. ESC/배경 클릭으로 닫힌다.
// ESC 닫기 + 열려 있는 동안 배경 스크롤 잠금 (Modal 과 동일한 패턴)
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

let prevOverflow = ''

function lock() {
  document.addEventListener('keydown', onKeyDown)
  prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlock() {
  document.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = prevOverflow
}

watch(
  () => props.open,
  (open) => {
    if (open) lock()
    else unlock()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (props.open) unlock()
})
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <button
        type="button"
        class="drawer-backdrop"
        aria-label="닫기"
        style="border: none; padding: 0; cursor: default"
        @click="emit('close')"
      />
      <aside class="drawer" :aria-label="title">
        <header class="drawer-header">
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
        <div class="drawer-body"><slot /></div>
      </aside>
    </template>
  </Teleport>
</template>
