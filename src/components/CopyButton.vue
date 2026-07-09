<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string // 복사할 내용
    label?: string // 버튼 라벨 (기본 "복사")
  }>(),
  { label: '복사' },
)

// 클릭하면 text 를 클립보드에 복사하고 잠시 "복사됨 ✓" 을 보여준다.
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // 클립보드 권한이 없으면 조용히 무시 (http 환경 등)
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <button
    type="button"
    :class="`copy-btn${copied ? ' copied' : ''}`"
    @click="handleCopy"
  >
    {{ copied ? '복사됨 ✓' : label }}
  </button>
</template>
