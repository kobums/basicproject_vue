<script lang="ts">
export interface SegmentOption {
  label: string
  value: string
}
</script>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  modelValue: string
  options: SegmentOption[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 붙어 있는 버튼 그룹에서 하나를 고르는 세그먼트 컨트롤 (보기 전환 등).
// 네이티브 라디오 그룹으로 구현 (키보드 방향키 탐색 무료 제공).
const groupName = useId()
</script>

<template>
  <div class="segmented">
    <label
      v-for="opt in options"
      :key="opt.value"
      :class="opt.value === modelValue ? 'active' : ''"
    >
      <input
        type="radio"
        :name="groupName"
        :value="opt.value"
        :checked="opt.value === modelValue"
        @change="emit('update:modelValue', opt.value)"
      />
      <span>{{ opt.label }}</span>
    </label>
  </div>
</template>
