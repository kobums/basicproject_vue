<script lang="ts">
export interface FilterOption {
  label: string
  value: string
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string[] // 선택된 value 배열 (빈 배열 = 전체)
    title: string // 필터 이름 (예: "상태") — 트리거에 표시
    options: FilterOption[]
    multi?: boolean // 다중 선택 (기본 true)
  }>(),
  { multi: true },
)

const emit = defineEmits<{ 'update:modelValue': [values: string[]] }>()

// 목록 상단에 두는 선택 필터. 선택이 없으면 "전체"로 간주하고,
// 다중 선택 시 첫 항목 + "외 N" 배지로 요약한다. (블루프린트 CommonFilter 포팅)
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

function toggle(value: string) {
  if (!props.multi) {
    emit('update:modelValue', props.modelValue.includes(value) ? [] : [value])
    open.value = false
    return
  }
  emit(
    'update:modelValue',
    props.modelValue.includes(value)
      ? props.modelValue.filter((v) => v !== value)
      : [...props.modelValue, value],
  )
}

function selectAll() {
  emit('update:modelValue', [])
  if (!props.multi) open.value = false
}

// 트리거 요약: 전체 / 첫 선택 라벨 (+ 외 N)
const summary = computed(() => {
  if (props.modelValue.length === 0) return '전체'
  return props.options.find((opt) => opt.value === props.modelValue[0])?.label
})
</script>

<template>
  <div ref="rootRef" :class="`dropdown${open ? ' open' : ''}`">
    <button
      type="button"
      class="dropdown-trigger"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>
        {{ title }}: {{ summary }}
        <span v-if="modelValue.length > 1" class="filter-count-badge">
          외 {{ modelValue.length - 1 }}
        </span>
      </span>
      <span class="dropdown-arrow" aria-hidden="true" />
    </button>

    <ul v-if="open" class="dropdown-menu">
      <li>
        <button
          type="button"
          :class="`dropdown-item${modelValue.length === 0 ? ' selected' : ''}`"
          @click="selectAll"
        >
          전체
        </button>
      </li>
      <li v-for="opt in options" :key="opt.value">
        <label v-if="multi" class="c-checkbox">
          <input
            type="checkbox"
            :checked="modelValue.includes(opt.value)"
            @change="toggle(opt.value)"
          />
          <span>{{ opt.label }}</span>
        </label>
        <button
          v-else
          type="button"
          :class="`dropdown-item${modelValue.includes(opt.value) ? ' selected' : ''}`"
          @click="toggle(opt.value)"
        >
          {{ opt.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
