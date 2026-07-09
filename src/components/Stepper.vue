<script setup lang="ts">
const props = defineProps<{
  steps: string[]
  current: number // 0-based 현재 단계
}>()

// 다단계 진행 표시기. current 이전은 완료(✓), current 는 강조.
function stateOf(index: number): string {
  if (index < props.current) return 'done'
  if (index === props.current) return 'active'
  return ''
}
</script>

<template>
  <ol class="stepper">
    <li v-for="(step, index) in steps" :key="step" :class="stateOf(index)">
      <span class="step-dot">{{ index < current ? '✓' : index + 1 }}</span>
      <span>{{ step }}</span>
      <span
        v-if="index < steps.length - 1"
        class="step-line"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>
