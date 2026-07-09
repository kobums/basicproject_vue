<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), {
  size: 'md',
})
</script>

<template>
  <!-- 회전 로딩 인디케이터. <output> 은 role="status" 의 네이티브 대응 요소 -->
  <output
    :class="`spinner${props.size === 'md' ? '' : ` spinner-${props.size}`}`"
    aria-label="로딩 중"
  />
</template>
