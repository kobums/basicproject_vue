<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Spinner from './Spinner.vue'

const props = defineProps<{
  hasMore: boolean
  loading: boolean
}>()

const emit = defineEmits<{ loadMore: [] }>()

// 목록 끝의 감시 지점(sentinel)이 보이면 loadMore 를 emit 하는 무한 스크롤 래퍼.
// IntersectionObserver 사용 — 스크롤 이벤트 폴링보다 효율적이다.
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!sentinelRef.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && props.hasMore && !props.loading) {
      emit('loadMore')
    }
  })
  observer.observe(sentinelRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div>
    <slot />
    <div v-if="hasMore" ref="sentinelRef" class="infinite-sentinel">
      <Spinner v-if="loading" size="sm" />
    </div>
  </div>
</template>
