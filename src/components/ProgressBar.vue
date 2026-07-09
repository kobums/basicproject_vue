<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number // 0~100
  label?: string // 있으면 위에 "라벨  N%" 표시
}>()

// 진행률 바. value 는 0~100 으로 클램프된다.
const clamped = computed(() => Math.min(100, Math.max(0, props.value)))
</script>

<template>
  <div>
    <div v-if="label" class="progress-label">
      <span>{{ label }}</span>
      <span>{{ Math.round(clamped) }}%</span>
    </div>
    <progress
      class="progress"
      :value="clamped"
      max="100"
      :aria-label="label ?? '진행률'"
    />
  </div>
</template>
