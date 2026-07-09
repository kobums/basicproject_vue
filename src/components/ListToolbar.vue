<script setup lang="ts">
import PageSizeSelect from './PageSizeSelect.vue'

defineProps<{
  info: string // 결과 안내 문구 (예: "전체 21건", "'x' 검색 결과 3건")
  size: number
}>()

const emit = defineEmits<{ sizeChange: [size: number] }>()

// 목록 위의 "결과 안내 + 페이지 크기 선택" 툴바.
</script>

<template>
  <div class="list-toolbar">
    <p class="search-result-info muted">{{ info }}</p>
    <PageSizeSelect
      :value="size"
      @change="(s: number) => emit('sizeChange', s)"
    />
  </div>
</template>
