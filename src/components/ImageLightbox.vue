<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

defineProps<{
  src: string
  alt: string
  imgClass?: string // 썸네일 img 에 얹을 클래스 (예: board-image)
}>()

// 클릭하면 전체 화면으로 확대되는 이미지. ESC/클릭으로 닫는다.
const open = ref(false)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

let prevOverflow = ''

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', onKeyDown)
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeyDown)
    document.body.style.overflow = prevOverflow
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  if (open.value) document.body.style.overflow = prevOverflow
})
</script>

<template>
  <button
    type="button"
    :aria-label="`${alt} 크게 보기`"
    style="border: none; padding: 0; background: none; cursor: zoom-in"
    @click="open = true"
  >
    <img
      :class="`lightbox-thumb${imgClass ? ` ${imgClass}` : ''}`"
      :src="src"
      :alt="alt"
    />
  </button>

  <Teleport to="body">
    <button
      v-if="open"
      type="button"
      class="lightbox-overlay"
      aria-label="닫기"
      @click="open = false"
    >
      <img :src="src" :alt="alt" />
      <span class="lightbox-close" aria-hidden="true">×</span>
    </button>
  </Teleport>
</template>
