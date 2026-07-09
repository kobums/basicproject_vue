<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string // 이니셜/색상 생성 + alt 텍스트
    src?: string | null // 있으면 이미지, 없으면 이니셜
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { src: null, size: 'md' },
)

// 이름 문자열에서 항상 같은 색이 나오도록 해시 → 팔레트 매핑 (토스 팔레트 계열)
const PALETTE = [
  '#3182f6',
  '#1b64da',
  '#03b26c',
  '#02a262',
  '#fe9800',
  '#f04452',
  '#6b7684',
]

const color = computed(() => {
  let hash = 0
  for (const ch of props.name)
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) % 2147483647
  return PALETTE[hash % PALETTE.length]
})

const initial = computed(() => props.name.charAt(0).toUpperCase())
</script>

<template>
  <!-- 프로필 아바타. 이미지가 없으면 이름 첫 글자 + 이름 기반 고정 색상. -->
  <span
    :class="`avatar avatar-${size}`"
    :style="src ? undefined : { background: color }"
    :title="name"
  >
    <img v-if="src" :src="src" :alt="name" />
    <template v-else>{{ initial }}</template>
  </span>
</template>
