<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: string
    placeholder?: string
    hint?: string // 입력 안내 (error 가 있으면 error 우선 표시)
    error?: string
    multiline?: boolean
    rows?: number
    maxlength?: number
    disabled?: boolean
    required?: boolean
  }>(),
  {
    type: 'text',
    multiline: false,
    rows: 4,
    maxlength: 255,
    disabled: false,
    required: false,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 라벨 + 입력 + 안내/에러 문구를 묶은 v-model 텍스트 입력.
function onInput(e: Event) {
  emit(
    'update:modelValue',
    (e.target as HTMLInputElement | HTMLTextAreaElement).value,
  )
}
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <textarea
      v-if="multiline"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      :required="required"
      @input="onInput"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :required="required"
      @input="onInput"
    />
    <small v-if="hint && !error" class="field-hint">{{ hint }}</small>
    <em v-if="error" class="field-error">{{ error }}</em>
  </label>
</template>
