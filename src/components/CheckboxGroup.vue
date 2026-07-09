<script lang="ts">
export interface CheckOption {
  label: string
  value: string
}
</script>

<script setup lang="ts">
import Checkbox from './Checkbox.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string[] // 선택된 value 배열
    name: string // 체크박스 id prefix (페이지 내 유일해야 함)
    options: CheckOption[]
    vertical?: boolean
    disabled?: boolean
  }>(),
  { vertical: false, disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [values: string[]] }>()

// 여러 항목 중 다중 선택하는 체크박스 그룹. 선택된 value 배열로 주고받는다.
function toggle(value: string, checked: boolean) {
  emit(
    'update:modelValue',
    checked
      ? [...props.modelValue, value]
      : props.modelValue.filter((v) => v !== value),
  )
}
</script>

<template>
  <div :class="`check-group${vertical ? ' vertical' : ''}`">
    <Checkbox
      v-for="opt in options"
      :id="`${name}-${opt.value}`"
      :key="opt.value"
      :name="name"
      :label="opt.label"
      :model-value="modelValue.includes(opt.value)"
      :disabled="disabled"
      @update:model-value="(checked: boolean) => toggle(opt.value, checked)"
    />
  </div>
</template>
