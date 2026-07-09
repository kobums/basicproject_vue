<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string // 기본 100%
    height?: string // 기본 16px
    circle?: boolean
  }>(),
  { width: '100%', height: '16px', circle: false },
)

// 로딩 중 자리 표시자 (shimmer 애니메이션).
</script>

<template>
  <span
    :class="`skeleton${circle ? ' circle' : ''}`"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>
