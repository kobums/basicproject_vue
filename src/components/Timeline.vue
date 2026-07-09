<script lang="ts">
export interface TimelineItem {
  title: string
  time?: string
  description?: string
  muted?: boolean // 아직 안 일어난/비활성 이벤트는 회색 점
}
</script>

<script setup lang="ts">
defineProps<{ items: TimelineItem[] }>()

// 시간순 이벤트를 세로로 나열하는 타임라인 (이력, 활동 로그 등).
</script>

<template>
  <ol class="timeline">
    <li
      v-for="item in items"
      :key="item.title"
      :class="item.muted ? 'muted-dot' : ''"
    >
      <span class="timeline-dot" aria-hidden="true" />
      <span v-if="item.time" class="timeline-time">{{ item.time }}</span>
      <span class="timeline-title">{{ item.title }}</span>
      <p v-if="item.description" class="timeline-desc">
        {{ item.description }}
      </p>
    </li>
  </ol>
</template>
