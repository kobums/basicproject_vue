<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BoardSearch, SearchType } from '../types/board'

// 현재 커밋된 검색 조건(초기값/리셋 기준)
const props = defineProps<{ value: BoardSearch }>()
const emit = defineEmits<{ search: [search: BoardSearch] }>()

const TYPE_OPTIONS: { value: SearchType; label: string }[] = [
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
  { value: 'all', label: '제목+내용' },
  { value: 'author', label: '작성자' },
]

// 게시판 목록 위에 놓이는 검색 입력줄. 입력 중인 값(draft)은 내부에서 관리하고,
// 제출/초기화 시에만 부모(useBoards)로 커밋한다.
const type = ref<SearchType>(props.value.type)
const keyword = ref(props.value.keyword)

function handleSubmit() {
  emit('search', { type: type.value, keyword: keyword.value.trim() })
}

function handleReset() {
  type.value = 'title'
  keyword.value = ''
  emit('search', { type: 'title', keyword: '' })
}

// 현재 전체 목록(검색 안 함) 상태인지 — 초기화 버튼 노출 여부 판단
const hasActiveSearch = computed(() => props.value.keyword.trim().length > 0)
</script>

<template>
  <search>
    <form class="search-bar" @submit.prevent="handleSubmit">
      <select v-model="type" class="search-type" aria-label="검색 조건">
        <option v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value">
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
