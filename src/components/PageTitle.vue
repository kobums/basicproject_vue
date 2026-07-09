<script lang="ts">
export interface KpiItem {
  label: string
  value: number | string
  accent?: boolean // 강조 카드 (전체 합계 등)
}
</script>

<script setup lang="ts">
defineProps<{
  title: string
  desc?: string
  kpis?: KpiItem[]
}>()

// 페이지 제목 + 설명 + 선택적 KPI 통계 카드.
</script>

<template>
  <header class="page-title">
    <h1>{{ title }}</h1>
    <p v-if="desc" class="desc">{{ desc }}</p>
    <div v-if="kpis && kpis.length > 0" class="kpi-cards">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        :class="`kpi-card${kpi.accent ? ' accent' : ''}`"
      >
        <span class="kpi-label">{{ kpi.label }}</span>
        <strong class="kpi-value">{{ kpi.value }}</strong>
      </div>
    </div>
  </header>
</template>
