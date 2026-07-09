<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ text: string }>()

// hover/focus 시 말풍선을 띄우는 CSS 기반 툴팁.
// 기본 슬롯이 없으면 ⓘ 아이콘 버튼을 트리거로 사용한다.
// 슬롯으로 커스텀 트리거를 넣을 때는 포커스 가능한 요소(버튼 등)를 넣어야 키보드로도 뜬다.
const bubbleId = useId()
</script>

<template>
  <span class="tooltip-wrap">
    <span class="tooltip-trigger">
      <slot>
        <button
          type="button"
          class="tooltip-icon-btn"
          aria-label="도움말"
          :aria-describedby="bubbleId"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      </slot>
    </span>
    <span :id="bubbleId" class="tooltip-bubble" role="tooltip">{{ text }}</span>
  </span>
</template>
