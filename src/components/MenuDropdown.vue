<script lang="ts">
export interface MenuItem {
  label: string
  action: string // select 이벤트로 전달되는 식별자
  danger?: boolean // 삭제 등 파괴적 동작은 빨간색
  divider?: boolean // true 면 이 항목 위에 구분선
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

withDefaults(
  defineProps<{
    items: MenuItem[]
    label?: string // 트리거 내용 (기본 ⋯ 아이콘)
    ariaLabel?: string // 스크린리더용 이름 (label 이 심볼일 때)
  }>(),
  { label: '⋯', ariaLabel: '메뉴' },
)

const emit = defineEmits<{ select: [action: string] }>()

// ⋯ 버튼을 누르면 나오는 액션 메뉴 (테이블 행의 수정/삭제 등).
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

function run(item: MenuItem) {
  open.value = false
  emit('select', item.action)
}
</script>

<template>
  <div ref="rootRef" class="dropdown" style="min-width: auto">
    <button
      type="button"
      class="menu-trigger"
      :aria-expanded="open"
      :aria-label="ariaLabel"
      @click="open = !open"
    >
      <span aria-hidden="true">{{ label }}</span>
    </button>

    <ul v-if="open" class="dropdown-menu" style="min-width: 140px">
      <li v-for="item in items" :key="item.action">
        <div v-if="item.divider" class="dropdown-divider" />
        <button
          type="button"
          :class="`dropdown-item${item.danger ? ' danger' : ''}`"
          @click="run(item)"
        >
          {{ item.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
