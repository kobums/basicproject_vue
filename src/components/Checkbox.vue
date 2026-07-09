<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    id: string | number
    label?: string
    name?: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [checked: boolean] }>()

// v-model 단일 체크박스. id 로 input/label 을 연결한다.
function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>

<template>
  <label class="c-checkbox" :for="`chk-${id}`">
    <input
      :id="`chk-${id}`"
      type="checkbox"
      :name="name"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
