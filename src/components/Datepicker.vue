<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string // 'YYYY-MM-DD' 또는 ''
    label?: string
    min?: string
    max?: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 네이티브 date input 래퍼. 라이브러리 없이 'YYYY-MM-DD' 문자열로 주고받는다.
function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <input
      type="date"
      :value="modelValue"
      :min="min"
      :max="max"
      :disabled="disabled"
      @input="onInput"
    />
  </label>
</template>
