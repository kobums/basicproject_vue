<script lang="ts">
export interface AccordionItem {
  title: string
  content: string
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    items: AccordionItem[]
    multiple?: boolean // true 면 여러 항목 동시 열기 허용
    defaultOpen?: number[] // 처음부터 열려 있을 인덱스
  }>(),
  { multiple: false, defaultOpen: () => [] },
)

// 접었다 펴는 아코디언 목록.
const openSet = ref(new Set<number>(props.defaultOpen))

function toggle(index: number) {
  const next = new Set(openSet.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    if (!props.multiple) next.clear()
    next.add(index)
  }
  openSet.value = next
}
</script>

<template>
  <div class="accordion">
    <div
      v-for="(item, index) in items"
      :key="item.title"
      :class="`accordion-item${openSet.has(index) ? ' open' : ''}`"
    >
      <button
        type="button"
        class="accordion-header"
        :aria-expanded="openSet.has(index)"
        @click="toggle(index)"
      >
        {{ item.title }}
        <span class="accordion-arrow" aria-hidden="true" />
      </button>
      <div v-if="openSet.has(index)" class="accordion-body">
        <!-- content 문자열 대신 커스텀 렌더가 필요하면 #body-<index> 슬롯 사용 -->
        <slot :name="`body-${index}`">{{ item.content }}</slot>
      </div>
    </div>
  </div>
</template>
