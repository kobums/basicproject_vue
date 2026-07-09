<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: string[] // 전체 후보 (입력값으로 부분 일치 필터)
    placeholder?: string
    ariaLabel?: string // 스크린리더용 이름 (시각 라벨이 따로 없을 때)
  }>(),
  { placeholder: '입력하여 검색', ariaLabel: '검색어 입력' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 입력하면 후보가 필터되어 나오는 자동완성 입력.
// 일치 부분은 <mark> 로 강조하고, 항목 클릭으로 확정한다.
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

const keyword = computed(() => props.modelValue.trim().toLowerCase())

const filtered = computed(() =>
  keyword.value
    ? props.options.filter((opt) => opt.toLowerCase().includes(keyword.value))
    : props.options,
)

// 일치 부분 강조: 앞/일치/뒤 세 조각으로 나눠 렌더
function parts(option: string): { pre: string; hit: string; post: string } {
  if (!keyword.value) return { pre: option, hit: '', post: '' }
  const index = option.toLowerCase().indexOf(keyword.value)
  if (index < 0) return { pre: option, hit: '', post: '' }
  return {
    pre: option.slice(0, index),
    hit: option.slice(index, index + keyword.value.length),
    post: option.slice(index + keyword.value.length),
  }
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  open.value = true
}

function pick(option: string) {
  emit('update:modelValue', option)
  open.value = false
}
</script>

<template>
  <div ref="rootRef" class="combobox">
    <input
      type="text"
      :aria-label="ariaLabel"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      @focus="open = true"
    />

    <ul v-if="open" class="dropdown-menu">
      <li v-if="filtered.length === 0" class="dropdown-empty">
        일치하는 항목이 없습니다.
      </li>
      <li v-for="opt in filtered" :key="opt">
        <button
          type="button"
          :class="`dropdown-item${opt === modelValue ? ' selected' : ''}`"
          @click="pick(opt)"
        >
          {{ parts(opt).pre
          }}<mark v-if="parts(opt).hit">{{ parts(opt).hit }}</mark
          >{{ parts(opt).post }}
        </button>
      </li>
    </ul>
  </div>
</template>
