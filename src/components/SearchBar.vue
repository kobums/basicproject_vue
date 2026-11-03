<script lang="ts">
// 검색 조건: 어느 필드(생성 SearchParams 의 key)에 어떤 값을 줄지.
export interface SearchValue {
  field: string
  keyword: string
}

export interface SearchOption {
  value: string
  label: string
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 현재 커밋된 검색 조건(초기값/리셋 기준)과 고를 수 있는 필드
const props = defineProps<{ value: SearchValue; options: SearchOption[] }>()
const emit = defineEmits<{ search: [search: SearchValue] }>()

// 목록 위에 놓이는 검색 입력줄. 입력 중인 값(draft)은 내부에서 관리하고,
// 제출/초기화 시에만 부모로 커밋한다.
const field = ref(props.value.field)
const keyword = ref(props.value.keyword)

function handleSubmit() {
  emit('search', { field: field.value, keyword: keyword.value.trim() })
}

function handleReset() {
  field.value = props.options[0]?.value ?? ''
  keyword.value = ''
  emit('search', { field: field.value, keyword: '' })
}

// 현재 전체 목록(검색 안 함) 상태인지 — 초기화 버튼 노출 여부 판단
const hasActiveSearch = computed(() => props.value.keyword.trim().length > 0)
</script>

<template>
  <search>
    <form class="search-bar" @submit.prevent="handleSubmit">
      <select v-model="field" class="search-type" aria-label="검색 조건">
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <input
        v-model="keyword"
        class="search-input"
        type="search"
        placeholder="검색어를 입력하세요"
        aria-label="검색어"
      />

      <button type="submit" class="btn btn-primary">검색</button>

      <button
        v-if="hasActiveSearch"
        type="button"
        class="btn"
        @click="handleReset"
      >
        초기화
      </button>
    </form>
  </search>
</template>
