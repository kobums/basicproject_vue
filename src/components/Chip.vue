<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    accent?: boolean // 강조 색상 (선택된 필터 등)
    removable?: boolean // 삭제(×) 버튼 표시 → remove 이벤트
  }>(),
  { accent: false, removable: false },
)

const emit = defineEmits<{ remove: [] }>()

// 선택된 항목/태그를 표시하는 작은 칩.
</script>

<template>
  <span :class="`chip${accent ? ' chip-accent' : ''}`">
    {{ label }}
    <button
      v-if="removable"
      type="button"
      class="chip-remove"
      :aria-label="`${label} 삭제`"
      @click="emit('remove')"
    >
      ×
    </button>
  </span>
</template>
