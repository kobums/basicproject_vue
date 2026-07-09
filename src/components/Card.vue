<script setup lang="ts">
defineProps<{ title?: string }>()

// 테두리+라운드 컨테이너. 헤더(#extra 슬롯: 우측 영역)/본문/푸터(#footer 슬롯) 구조.
</script>

<template>
  <div class="card">
    <div v-if="title || $slots.extra" class="card-header">
      <span>{{ title }}</span>
      <slot name="extra" />
    </div>
    <div class="card-body"><slot /></div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
