<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: File[]
    accept?: string // 예: 'image/*'
    multiple?: boolean
  }>(),
  { multiple: false },
)

const emit = defineEmits<{ 'update:modelValue': [files: File[]] }>()

// 클릭 또는 드래그&드롭으로 파일을 고르는 업로드 영역. 선택 목록 + 개별 삭제 제공.
const inputRef = ref<HTMLInputElement | null>(null)
const dragover = ref(false)

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function addFiles(added: File[]) {
  if (added.length === 0) return
  emit(
    'update:modelValue',
    props.multiple ? [...props.modelValue, ...added] : added.slice(0, 1),
  )
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement
  addFiles(Array.from(input.files ?? []))
  input.value = '' // 같은 파일 재선택 가능하도록 리셋
}

function handleDrop(e: DragEvent) {
  dragover.value = false
  addFiles(Array.from(e.dataTransfer?.files ?? []))
}

function remove(index: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}
</script>

<template>
  <div>
    <button
      type="button"
      :class="`file-drop${dragover ? ' dragover' : ''}`"
      style="width: 100%; font: inherit; background: none"
      @click="inputRef?.click()"
      @dragover.prevent="dragover = true"
      @dragleave="dragover = false"
      @drop.prevent="handleDrop"
    >
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span>
        클릭하거나 파일을 끌어다 놓으세요{{ multiple ? ' (여러 개 가능)' : '' }}
      </span>
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        aria-label="파일 선택"
        @change="handleInput"
      />
    </button>

    <ul v-if="modelValue.length > 0" class="file-list">
      <li v-for="(file, index) in modelValue" :key="`${file.name}-${index}`">
        <span>{{ file.name }}</span>
        <span class="file-size">{{ formatSize(file.size) }}</span>
        <button
          type="button"
          class="file-remove"
          :aria-label="`${file.name} 삭제`"
          @click="remove(index)"
        >
          <span aria-hidden="true">×</span>
        </button>
      </li>
    </ul>
  </div>
</template>
