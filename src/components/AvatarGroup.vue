<script setup lang="ts">
import { computed } from 'vue'
import Avatar from './Avatar.vue'

const props = withDefaults(
  defineProps<{
    names: string[]
    max?: number // 이 수를 넘으면 "+N" 으로 요약
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { max: 4, size: 'md' },
)

// 아바타를 겹쳐 쌓고, 넘치는 인원은 "+N" 으로 표시.
const visible = computed(() => props.names.slice(0, props.max))
const rest = computed(() => props.names.length - visible.value.length)
</script>

<template>
  <div class="avatar-group" :title="names.join(', ')">
    <Avatar v-for="name in visible" :key="name" :name="name" :size="size" />
    <span v-if="rest > 0" :class="`avatar avatar-${size} avatar-more`">
      +{{ rest }}
    </span>
  </div>
</template>
