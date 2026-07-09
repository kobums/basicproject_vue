<script lang="ts">
export interface DropdownOption {
  label: string
  value: string | number
}

// 선택 값 (null = 선택 없음)
export type DropdownValue = string | number | null
</script>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: DropdownValue
    options: DropdownOption[]
    placeholder?: string
    resetLabel?: string // 있으면 맨 위에 선택 해제(전체) 항목 추가
    disabled?: boolean
  }>(),
  { placeholder: '선택하세요', disabled: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: DropdownValue]
}>()

// 네이티브 select 대신 목록을 직접 그리는 커스텀 드롭다운. 바깥 클릭 감지로 닫힌다.
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const selected = computed(() =>
  props.options.find((opt) => opt.value === props.modelValue),
)

function onPointerDown(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

// 열려 있는 동안만 document 리스너 유지
watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('mousedown', onPointerDown)
  else document.removeEventListener('mousedown', onPointerDown)
})

onBeforeUnmount(() => document.removeEventListener('mousedown', onPointerDown))

function pick(value: DropdownValue) {
  emit('update:modelValue', value)
  open.value = false
}
</script>

<template>
  <div ref="rootRef" :class="`dropdown${open ? ' open' : ''}`">
    <button
      type="button"
      class="dropdown-trigger"
      :disabled="disabled"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span v-if="selected">{{ selected.label }}</span>
      <span v-else class="placeholder">{{ placeholder }}</span>
      <span class="dropdown-arrow" aria-hidden="true" />
    </button>

    <ul v-if="open" class="dropdown-menu">
      <li v-if="resetLabel">
        <button
          type="button"
          :class="`dropdown-item${modelValue === null ? ' selected' : ''}`"
          @click="pick(null)"
        >
          {{ resetLabel }}
        </button>
      </li>
      <li v-if="options.length === 0" class="dropdown-empty">
        선택 가능한 옵션이 없습니다.
      </li>
      <li v-for="opt in options" :key="opt.value">
        <button
          type="button"
          :class="`dropdown-item${opt.value === modelValue ? ' selected' : ''}`"
          @click="pick(opt.value)"
        >
          {{ opt.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
