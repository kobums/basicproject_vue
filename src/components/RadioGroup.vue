<script setup lang="ts">
import type { CheckOption } from './CheckboxGroup.vue'

withDefaults(
  defineProps<{
    modelValue: string
    name: string // 라디오 그룹명 (페이지 내 유일해야 함)
    options: CheckOption[]
    vertical?: boolean
    disabled?: boolean
  }>(),
  { vertical: false, disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 여러 항목 중 하나만 선택하는 라디오 그룹.
</script>

<template>
  <div :class="`check-group${vertical ? ' vertical' : ''}`">
    <label v-for="opt in options" :key="opt.value" class="c-radio">
      <input
        type="radio"
        :name="name"
        :value="opt.value"
        :checked="modelValue === opt.value"
        :disabled="disabled"
        @change="emit('update:modelValue', opt.value)"
      />
      <span>{{ opt.label }}</span>
    </label>
  </div>
</template>
