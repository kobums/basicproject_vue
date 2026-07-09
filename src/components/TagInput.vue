<script setup lang="ts">
import { ref } from 'vue'
import Chip from './Chip.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    placeholder?: string
    max?: number // 최대 태그 수
  }>(),
  { placeholder: '입력 후 Enter' },
)

const emit = defineEmits<{ 'update:modelValue': [tags: string[]] }>()

// Enter/쉼표로 태그를 추가하고 ×/Backspace 로 삭제하는 태그 입력.
const draft = ref('')

function add() {
  const tag = draft.value.trim().replace(/,$/, '')
  draft.value = ''
  if (!tag || props.modelValue.includes(tag)) return // 중복은 조용히 무시
  if (props.max && props.modelValue.length >= props.max) return
  emit('update:modelValue', [...props.modelValue, tag])
}

function handleKeyDown(e: KeyboardEvent) {
  // 한글 IME 조합 확정용 Enter 는 무시 (조합 중 keydown 이 한 번 더 발생)
  if (e.isComposing) return
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    add()
  } else if (
    e.key === 'Backspace' &&
    draft.value === '' &&
    props.modelValue.length > 0
  ) {
    // 입력이 비어 있을 때 Backspace → 마지막 태그 삭제
    emit('update:modelValue', props.modelValue.slice(0, -1))
  }
}

function remove(tag: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((t) => t !== tag),
  )
}
</script>

<template>
  <!-- label 이라 컨테이너 아무 곳이나 클릭해도 입력에 포커스 (네이티브 동작) -->
  <label class="tag-input">
    <Chip
      v-for="tag in modelValue"
      :key="tag"
      :label="tag"
      accent
      removable
      @remove="remove(tag)"
    />
    <input
      v-model="draft"
      type="text"
      :placeholder="modelValue.length === 0 ? placeholder : ''"
      aria-label="태그 입력"
      @keydown="handleKeyDown"
      @blur="add"
    />
  </label>
</template>
