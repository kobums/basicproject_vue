<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    options?: number[] // 선택 가능한 페이지 크기 (기본 10/20/50/100)
  }>(),
  { options: () => [10, 20, 50, 100] },
)

const emit = defineEmits<{ change: [size: number] }>()

function handleChange(e: Event) {
  emit('change', Number((e.target as HTMLSelectElement).value))
}
</script>

<template>
  <!-- 접근성·모바일 호환을 위해 네이티브 <select> 를 쓰되, 래퍼 + CSS 로 우리 디자인을 입힌다. -->
  <div class="select-wrap">
    <select
      class="select"
      :value="props.value"
      aria-label="페이지당 표시 개수"
      @change="handleChange"
    >
      <option v-for="size in options" :key="size" :value="size">
        {{ size }}개씩 보기
      </option>
    </select>
  </div>
</template>
