<script setup lang="ts">
import { ref } from 'vue'
import TreeItem, { type TreeNode } from './TreeItem.vue'

defineProps<{ nodes: TreeNode[] }>()

const emit = defineEmits<{ select: [label: string] }>()

// 폴더처럼 펼치고 접는 계층 트리. 리프 클릭 시 select 이벤트.
const selected = ref<string | null>(null)

function handleSelect(label: string) {
  selected.value = label
  emit('select', label)
}
</script>

<template>
  <ul class="tree">
    <TreeItem
      v-for="node in nodes"
      :key="node.label"
      :node="node"
      :selected="selected"
      @select="handleSelect"
    />
  </ul>
</template>
