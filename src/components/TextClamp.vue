<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    lines?: number // 접었을 때 보여줄 줄 수
  }>(),
  { lines: 3 },
)

// 긴 텍스트를 n줄로 접고 "더보기/접기" 로 토글.
// 실제로 넘칠 때만 버튼을 보여준다 (scrollHeight 측정).
const expanded = ref(false)
const overflowing = ref(false)
const pRef = ref<HTMLParagraphElement | null>(null)

function measure() {
  const el = pRef.value
  if (!el) return
  overflowing.value = el.scrollHeight > el.clientHeight + 1
}

onMounted(measure)
watch(
  () => [props.text, props.lines],
  () => void nextTick(measure),
)
</script>

<template>
  <div class="text-clamp">
    <p
      ref="pRef"
      :class="expanded ? '' : 'clamped'"
      :style="expanded ? undefined : { '-webkit-line-clamp': String(lines) }"
    >
      {{ text }}
    </p>
    <button
      v-if="overflowing || expanded"
      type="button"
      class="clamp-toggle"
      @click="expanded = !expanded"
    >
      {{ expanded ? '접기' : '더보기' }}
    </button>
  </div>
</template>
