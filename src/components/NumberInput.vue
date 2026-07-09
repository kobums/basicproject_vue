<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    ariaLabel?: string // 스크린리더용 이름 (시각 라벨이 따로 없을 때)
  }>(),
  {
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    step: 1,
    ariaLabel: '숫자 입력',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

// −/＋ 버튼이 달린 숫자 입력. min/max 로 클램프한다.
function clamp(n: number): number {
  return Math.min(props.max, Math.max(props.min, n))
}

function handleInput(e: Event) {
  const n = Number((e.target as HTMLInputElement).value)
  if (!Number.isNaN(n)) emit('update:modelValue', clamp(n))
}
</script>

<template>
  <div class="number-input">
    <button
      type="button"
      aria-label="감소"
      :disabled="modelValue <= min"
      @click="emit('update:modelValue', clamp(modelValue - step))"
    >
      <span aria-hidden="true">−</span>
    </button>
    <input
      type="number"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :aria-label="ariaLabel"
      @input="handleInput"
    />
    <button
      type="button"
      aria-label="증가"
      :disabled="modelValue >= max"
      @click="emit('update:modelValue', clamp(modelValue + step))"
    >
      <span aria-hidden="true">＋</span>
    </button>
  </div>
</template>
