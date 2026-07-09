<script lang="ts">
// 리스트 항목. id 는 목록 안에서 유일해야 한다.
export interface ListManagerItem {
  id: number
  label: string
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: ListManagerItem[]
    placeholder?: string
  }>(),
  { placeholder: '새 항목 입력 후 Enter' },
)

const emit = defineEmits<{ 'update:modelValue': [items: ListManagerItem[]] }>()

// 드래그로 순서를 바꾸고, 검색·추가·체크박스 선택 삭제까지 지원하는 리스트 관리자.
const keyword = ref('')
const draft = ref('')
const selected = ref<Set<number>>(new Set())
const dragId = ref<number | null>(null)

// 검색 중에는 보이는 순서와 실제 순서가 달라 드래그 정렬을 비활성화한다.
const filtering = computed(() => keyword.value.trim() !== '')
const visible = computed(() =>
  filtering.value
    ? props.modelValue.filter((it) =>
        it.label.toLowerCase().includes(keyword.value.trim().toLowerCase()),
      )
    : props.modelValue,
)

const selectedCount = computed(
  () => props.modelValue.filter((it) => selected.value.has(it.id)).length,
)
const allChecked = computed(
  () =>
    visible.value.length > 0 &&
    visible.value.every((it) => selected.value.has(it.id)),
)

function add() {
  const label = draft.value.trim()
  draft.value = ''
  if (!label || props.modelValue.some((it) => it.label === label)) return // 중복은 조용히 무시
  const nextId =
    props.modelValue.reduce((max, it) => Math.max(max, it.id), 0) + 1
  emit('update:modelValue', [...props.modelValue, { id: nextId, label }])
}

function toggle(id: number, checked: boolean) {
  const next = new Set(selected.value)
  if (checked) next.add(id)
  else next.delete(id)
  selected.value = next
}

function toggleAll(checked: boolean) {
  const next = new Set(selected.value)
  visible.value.forEach((it) => {
    if (checked) next.add(it.id)
    else next.delete(it.id)
  })
  selected.value = next
}

function removeOne(id: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((it) => it.id !== id),
  )
  toggle(id, false)
}

function removeSelected() {
  emit(
    'update:modelValue',
    props.modelValue.filter((it) => !selected.value.has(it.id)),
  )
  selected.value = new Set()
}

// 드래그 중인 항목이 다른 항목 위로 올라오면 즉시 자리를 바꾼다(라이브 정렬).
function handleDragEnter(overId: number) {
  if (dragId.value === null || dragId.value === overId) return
  const next = [...props.modelValue]
  const from = next.findIndex((it) => it.id === dragId.value)
  const to = next.findIndex((it) => it.id === overId)
  next.splice(to, 0, next.splice(from, 1)[0])
  emit('update:modelValue', next)
}

function isChecked(e: Event) {
  return (e.target as HTMLInputElement).checked
}

function handleEnter(e: KeyboardEvent) {
  // 한글 IME 조합 확정용 Enter 는 무시 (조합 중 keydown 이 한 번 더 발생)
  if (e.isComposing) return
  add()
}
</script>

<template>
  <div class="list-manager">
    <div class="lm-toolbar">
      <label class="c-checkbox">
        <input
          type="checkbox"
          :checked="allChecked"
          :disabled="visible.length === 0"
          aria-label="전체 선택"
          @change="toggleAll(isChecked($event))"
        />
      </label>
      <input
        v-model="keyword"
        type="search"
        placeholder="검색"
        aria-label="항목 검색"
      />
      <button
        type="button"
        class="btn btn-sm btn-danger"
        :disabled="selectedCount === 0"
        @click="removeSelected"
      >
        선택 삭제{{ selectedCount > 0 ? ` (${selectedCount})` : '' }}
      </button>
    </div>

    <ul class="lm-list">
      <!-- 드래그 정렬은 포인터 전용 부가 기능. 키보드로는 체크박스 선택·삭제·추가가 모두 가능하다. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <li
        v-for="item in visible"
        :key="item.id"
        class="lm-item"
        :class="{ dragging: dragId === item.id }"
        :draggable="!filtering"
        @dragstart="dragId = item.id"
        @dragenter="handleDragEnter(item.id)"
        @dragover.prevent
        @dragend="dragId = null"
      >
        <span v-if="!filtering" class="lm-handle" aria-hidden="true">⠿</span>
        <label class="c-checkbox">
          <input
            type="checkbox"
            :checked="selected.has(item.id)"
            :aria-label="`${item.label} 선택`"
            @change="toggle(item.id, isChecked($event))"
          />
        </label>
        <span class="lm-label">{{ item.label }}</span>
        <button
          type="button"
          class="lm-remove"
          :aria-label="`${item.label} 삭제`"
          @click="removeOne(item.id)"
        >
          <span aria-hidden="true">×</span>
        </button>
      </li>
      <li v-if="visible.length === 0" class="lm-empty">
        {{ filtering ? '검색 결과가 없습니다.' : '항목이 없습니다.' }}
      </li>
    </ul>

    <div class="lm-add">
      <input
        v-model="draft"
        type="text"
        :placeholder="placeholder"
        aria-label="새 항목"
        @keydown.enter.prevent="handleEnter"
      />
      <button type="button" class="btn btn-sm" @click="add">추가</button>
    </div>
    <p v-if="filtering" class="lm-hint">
      검색 중에는 드래그 정렬이 비활성화됩니다.
    </p>
  </div>
</template>
