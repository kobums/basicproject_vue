<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    showValue?: boolean // 우측에 현재 값 표시 (기본 true)
    ariaLabel?: string // 스크린리더용 이름 (시각 라벨이 따로 없을 때)
  }>(),
  { min: 0, max: 100, step: 1, showValue: true, ariaLabel: '값 조절' },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

// 드래그로 값을 고르는 슬라이더 (네이티브 range 스타일링).
function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="slider-wrap">
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :aria-label="ariaLabel"
      @input="onInput"
    />
    <span v-if="showValue" class="slider-value">{{ modelValue }}</span>
  </div>
</template>
