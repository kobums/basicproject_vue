<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number // 0-based 현재 페이지
    totalPages: number
    blockSize?: number // 한 번에 보여줄 페이지 번호 개수 (기본 10)
  }>(),
  { blockSize: 10 },
)

const emit = defineEmits<{ change: [page: number] }>()

// 현재 페이지가 속한 블록(10개 단위)의 시작/끝 페이지 (0-based)
const pages = computed(() => {
  const currentBlock = Math.floor(props.page / props.blockSize)
  const startPage = currentBlock * props.blockSize
  const endPage = Math.min(
    startPage + props.blockSize - 1,
    props.totalPages - 1,
  )

  const list: number[] = []
  for (let p = startPage; p <= endPage; p++) list.push(p)
  return list
})

const isFirst = computed(() => props.page <= 0)
const isLast = computed(() => props.page >= props.totalPages - 1)
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="페이지 이동">
    <button
      type="button"
      class="page-btn"
      :disabled="isFirst"
      @click="emit('change', 0)"
    >
      « 맨처음
    </button>
    <button
      type="button"
      class="page-btn"
      :disabled="isFirst"
      @click="emit('change', page - 1)"
    >
      ‹ 이전
    </button>

    <ul class="page-numbers">
      <li v-for="p in pages" :key="p">
        <button
          type="button"
          :class="`page-num${p === page ? ' active' : ''}`"
          :aria-current="p === page ? 'page' : undefined"
          @click="emit('change', p)"
        >
          {{ p + 1 }}
        </button>
      </li>
    </ul>

    <button
      type="button"
      class="page-btn"
      :disabled="isLast"
      @click="emit('change', page + 1)"
    >
      다음 ›
    </button>
    <button
      type="button"
      class="page-btn"
      :disabled="isLast"
      @click="emit('change', totalPages - 1)"
    >
      맨나중 »
    </button>
  </nav>
</template>
