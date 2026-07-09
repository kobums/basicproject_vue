<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  { placeholder: '검색어를 입력하세요' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [] // Enter 또는 돋보기 클릭
}>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <!-- 돋보기 버튼이 달린 검색 입력창. Enter 제출을 위해 form 으로 감싼다. -->
  <search>
    <form class="search-field" @submit.prevent="emit('search')">
      <input
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        aria-label="검색어"
        @input="onInput"
      />
      <button type="submit" aria-label="검색">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  </search>
</template>
