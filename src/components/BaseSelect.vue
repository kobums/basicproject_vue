<script lang="ts">
export interface SelectOption {
  label: string
  value: string
}
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    options: SelectOption[]
    label?: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 네이티브 <select> 래퍼. 접근성/모바일 호환을 유지하면서 .select-wrap CSS 로 디자인을 입힌다.
function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <div class="select-wrap">
      <select
        class="select"
        :value="modelValue"
        :disabled="disabled"
        @change="onChange"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
  </label>
</template>
