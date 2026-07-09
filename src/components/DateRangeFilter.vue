<script setup lang="ts">
defineProps<{
  start: string // 'YYYY-MM-DD' 또는 ''
  end: string
  label?: string
}>()

const emit = defineEmits<{
  'update:start': [date: string]
  'update:end': [date: string]
}>()

// 시작일~종료일 범위 입력 (v-model:start / v-model:end).
// 시작일 max=종료일, 종료일 min=시작일로 서로 제한해 역전된 범위를 만들 수 없게 한다.
function onStart(e: Event) {
  emit('update:start', (e.target as HTMLInputElement).value)
}

function onEnd(e: Event) {
  emit('update:end', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="field">
    <span v-if="label">{{ label }}</span>
    <div class="date-range">
      <input
        type="date"
        :value="start"
        :max="end || undefined"
        aria-label="시작일"
        @input="onStart"
      />
      <span class="tilde">~</span>
      <input
        type="date"
        :value="end"
        :min="start || undefined"
        aria-label="종료일"
        @input="onEnd"
      />
    </div>
  </div>
</template>
