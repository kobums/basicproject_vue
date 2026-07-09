<script lang="ts">
export type AlertVariant = 'info' | 'success' | 'warning' | 'error'
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: AlertVariant
    title?: string
    closable?: boolean // 닫기(×) 버튼 표시
  }>(),
  { variant: 'info', closable: false },
)

// 페이지 안에 고정으로 놓는 안내/경고 배너. (토스트와 달리 사라지지 않음)
const closed = ref(false)

// 원 안에 i / ✓ / ! 표시
const mark = computed(
  () => ({ info: 'i', success: '✓', warning: '!', error: '!' })[props.variant],
)
</script>

<template>
  <div v-if="!closed" :class="`alert alert-${variant}`" role="alert">
    <span class="alert-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <text
          x="12"
          y="16.5"
          text-anchor="middle"
          font-size="13"
          font-weight="700"
          fill="currentColor"
        >
          {{ mark }}
        </text>
      </svg>
    </span>
    <div class="alert-body">
      <strong v-if="title" class="alert-title">{{ title }}</strong>
      <slot />
    </div>
    <button
      v-if="closable"
      type="button"
      class="alert-close"
      aria-label="닫기"
      @click="closed = true"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>
