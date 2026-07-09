<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    label?: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [checked: boolean] }>()

// 켜짐/꺼짐 토글 스위치. 내부는 체크박스라 키보드/폼 호환.
function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>

<template>
  <label class="switch">
    <input
      type="checkbox"
      role="switch"
      :aria-checked="modelValue"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
