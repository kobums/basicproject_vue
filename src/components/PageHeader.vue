<script setup lang="ts">
defineProps<{ title: string }>()

// 목록 페이지 상단의 "제목 + 우측 액션 버튼" 헤더. 기본 슬롯이 우측 액션 영역.
</script>

<template>
  <header class="page-header">
    <h1>{{ title }}</h1>
    <slot />
  </header>
</template>
