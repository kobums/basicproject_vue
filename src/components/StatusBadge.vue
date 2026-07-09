<script lang="ts">
// 상태를 색상으로 구분해 보여주는 알약 배지
export type BadgeVariant = 'green' | 'red' | 'gray' | 'blue' | 'purple'
</script>

<script setup lang="ts">
defineProps<{
  label: string
  variant: BadgeVariant
}>()
</script>

<template>
  <span :class="`badge badge-${variant}`">{{ label }}</span>
</template>
