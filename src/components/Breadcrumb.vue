<script lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string // 없으면 링크 없이 텍스트 (보통 마지막 항목)
}
</script>

<script setup lang="ts">
defineProps<{ items: BreadcrumbItem[] }>()

// 현재 위치 경로 표시 (Home / 그룹 / 현재).
</script>

<template>
  <nav aria-label="현재 위치">
    <ol class="breadcrumb">
      <li v-for="item in items" :key="item.label">
        <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <template v-else>{{ item.label }}</template>
      </li>
    </ol>
  </nav>
</template>
