<script lang="ts">
export interface TabItem {
  label: string
  value: string
}
</script>

<script setup lang="ts">
defineProps<{
  modelValue: string
  tabs: TabItem[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 밑줄 스타일 탭 바. 내용 전환은 부모가 v-model 값으로 처리한다.
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="tab.value === modelValue"
      :class="`tab-btn${tab.value === modelValue ? ' active' : ''}`"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
