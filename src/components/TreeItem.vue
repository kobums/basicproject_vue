<script lang="ts">
export interface TreeNode {
  label: string
  children?: TreeNode[]
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  node: TreeNode
  selected: string | null
}>()

const emit = defineEmits<{ select: [label: string] }>()

// Tree 의 재귀 노드. 자식이 있으면 펼치고 접고, 리프면 select 이벤트.
const open = ref(false)
const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0)

function handleClick() {
  if (hasChildren.value) open.value = !open.value
  else emit('select', props.node.label)
}
</script>

<template>
  <li :class="`tree-item${open ? ' open' : ''}`">
    <button
      type="button"
      :class="`tree-row${selected === node.label ? ' selected' : ''}`"
      :aria-expanded="hasChildren ? open : undefined"
      @click="handleClick"
    >
      <span
        :class="`tree-toggle${hasChildren ? '' : ' leaf'}`"
        aria-hidden="true"
      />
      {{ node.label }}
    </button>
    <ul v-if="hasChildren && open">
      <TreeItem
        v-for="child in node.children"
        :key="child.label"
        :node="child"
        :selected="selected"
        @select="(label: string) => emit('select', label)"
      />
    </ul>
  </li>
</template>
