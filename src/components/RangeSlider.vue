<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    start: number
    end: number
    min?: number
    max?: number
    step?: number
  }>(),
  { min: 0, max: 100, step: 1 },
)

const emit = defineEmits<{
  'update:start': [value: number]
  'update:end': [value: number]
}>()

// 최소~최대 범위를 고르는 듀얼 썸 슬라이더 (가격대 필터 등).
// range input 두 개를 겹치고 썸만 클릭에 반응하게 해서 구현.
function pct(v: number): number {
  return ((v - props.min) / (props.max - props.min)) * 100
}

function onStart(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  emit('update:start', Math.min(v, props.end))
}

function onEnd(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  emit('update:end', Math.max(v, props.start))
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <div class="range-slider">
      <span class="range-track" aria-hidden="true" />
      <span
        class="range-fill"
        aria-hidden="true"
        :style="{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }"
      />
      <input
        type="range"
        :value="start"
        :min="min"
        :max="max"
        :step="step"
        aria-label="최소값"
        @input="onStart"
      />
      <input
        type="range"
        :value="end"
        :min="min"
        :max="max"
        :step="step"
        aria-label="최대값"
        @input="onEnd"
      />
    </div>
    <span class="range-values">{{ start }} ~ {{ end }}</span>
  </div>
</template>
