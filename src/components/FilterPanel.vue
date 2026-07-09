<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

withDefaults(defineProps<{ label?: string }>(), { label: '상세검색' })

const emit = defineEmits<{ reset: []; search: [] }>()

// "상세검색" 버튼 + 팝오버 패널. 기본 슬롯으로 필터 폼을 받고
// 초기화/검색 버튼을 제공한다. 검색 시 패널이 닫힌다. (블루프린트 CommonFilterSearch 포팅)
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function onPointerDown(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('mousedown', onPointerDown)
  else document.removeEventListener('mousedown', onPointerDown)
})

onBeforeUnmount(() => document.removeEventListener('mousedown', onPointerDown))

function handleSearch() {
  emit('search')
  open.value = false
}
</script>

<template>
  <div ref="rootRef" class="filter-panel-wrap">
    <button
      type="button"
      class="btn"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ label }}
    </button>

    <div v-if="open" class="filter-panel">
      <div class="filter-panel-body"><slot /></div>
      <div class="filter-panel-actions">
        <button type="button" class="btn" @click="emit('reset')">초기화</button>
        <button type="button" class="btn btn-primary" @click="handleSearch">
          검색
        </button>
      </div>
    </div>
  </div>
</template>
