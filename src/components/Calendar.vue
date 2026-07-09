<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: string // 'YYYY-MM-DD' 또는 ''
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 월 그리드 달력. 이전/다음 달 이동, 오늘 강조, 날짜 선택.
// (Datepicker 가 네이티브 input 이라면, 이건 그리드를 직접 그리는 학습용 구현)
const DOW = ['일', '월', '화', '수', '목', '금', '토']

const today = new Date()
const selected = computed(() =>
  props.modelValue ? new Date(`${props.modelValue}T00:00:00`) : null,
)

// 보고 있는 달 (선택값이 있으면 그 달부터, 없으면 이번 달)
const viewYear = ref(selected.value?.getFullYear() ?? today.getFullYear())
const viewMonth = ref(selected.value?.getMonth() ?? today.getMonth())

function move(delta: number) {
  const next = new Date(viewYear.value, viewMonth.value + delta, 1)
  viewYear.value = next.getFullYear()
  viewMonth.value = next.getMonth()
}

// 그리드 시작: 그 달 1일이 속한 주의 일요일부터 6주(42칸)
const cells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const start = new Date(viewYear.value, viewMonth.value, 1 - first.getDay())
  return Array.from(
    { length: 42 },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  )
})

function isSame(a: Date, b: Date | null): boolean {
  return (
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function dayClass(d: Date): string {
  return [
    'calendar-day',
    d.getMonth() !== viewMonth.value ? 'outside' : '',
    isSame(d, today) ? 'today' : '',
    isSame(d, selected.value) ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function pick(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  emit(
    'update:modelValue',
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  )
}
</script>

<template>
  <div class="calendar">
    <div class="calendar-head">
      <button
        type="button"
        class="calendar-nav"
        aria-label="이전 달"
        @click="move(-1)"
      >
        <span aria-hidden="true">‹</span>
      </button>
      <span class="calendar-title">{{ viewYear }}년 {{ viewMonth + 1 }}월</span>
      <button
        type="button"
        class="calendar-nav"
        aria-label="다음 달"
        @click="move(1)"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>

    <div class="calendar-grid">
      <span
        v-for="(d, i) in DOW"
        :key="d"
        :class="`dow${i === 0 ? ' sun' : ''}`"
      >
        {{ d }}
      </span>
      <button
        v-for="d in cells"
        :key="d.toISOString()"
        type="button"
        :class="dayClass(d)"
        @click="pick(d)"
      >
        {{ d.getDate() }}
      </button>
    </div>
  </div>
</template>
