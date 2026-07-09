<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{ threshold?: number }>(), // 이만큼 스크롤해야 버튼 표시 (px)
  { threshold: 300 },
)

// 스크롤을 내리면 우하단에 나타나는 "맨 위로" 플로팅 버튼.
const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > props.threshold
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Teleport to="body">
    <button
      v-if="visible"
      type="button"
      class="back-to-top"
      aria-label="맨 위로"
      @click="scrollToTop"
    >
      <span aria-hidden="true">↑</span>
    </button>
  </Teleport>
</template>
