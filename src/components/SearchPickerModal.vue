<script setup lang="ts" generic="T">
import { ref, shallowRef, watch } from 'vue'
import Modal from './Modal.vue'
import SearchInput from './SearchInput.vue'
import DataTable, { type DataTableColumn } from './DataTable.vue'
import Pagination from './Pagination.vue'
import type { PageResponse } from '../types/page'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    // 페이지(0-based)와 검색어를 받아 목록을 조회하는 함수 (예: 회원 목록 API)
    fetchItems: (page: number, keyword: string) => Promise<PageResponse<T>>
    columns: DataTableColumn[]
    rowKey: (item: T) => string | number
    placeholder?: string
    emptyText?: string
  }>(),
  { placeholder: '검색어를 입력하세요', emptyText: '검색 결과가 없습니다.' },
)

const emit = defineEmits<{
  close: []
  select: [item: T] // 행 클릭 = 선택 (선택 후 모달 닫힘)
}>()

// 모달 안에서 검색 + 목록 + 페이징으로 항목 하나를 고르는 컴포넌트.
// Modal / SearchInput / DataTable / Pagination 조합 예제이기도 하다.
const keyword = ref('') // 입력 중인 값
const applied = ref('') // 실제 조회에 반영된 검색어
const page = ref(0)
// 제네릭 T 가 ref 의 깊은 언랩핑과 충돌하지 않도록 shallowRef 사용
const data = shallowRef<PageResponse<T> | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await props.fetchItems(page.value, applied.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

// 열릴 때마다 검색 상태 초기화 후 1페이지 조회
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    keyword.value = ''
    applied.value = ''
    page.value = 0
    void load()
  },
)

watch([page, applied], () => {
  if (props.open) void load()
})

function handleSearch() {
  applied.value = keyword.value.trim()
  page.value = 0
}

function handleSelect(item: T) {
  emit('select', item)
  emit('close')
}
</script>

<template>
  <Modal :open="open" :title="title" @close="emit('close')">
    <div class="picker-body">
      <SearchInput
        v-model="keyword"
        :placeholder="placeholder"
        @search="handleSearch"
      />

      <p v-if="error" class="error">{{ error }}</p>

      <div class="picker-list">
        <p v-if="loading && !data" class="muted">불러오는 중…</p>
        <DataTable
          v-else-if="data"
          :columns="columns"
          :data="data.content"
          :row-key="rowKey"
          clickable
          :empty-text="emptyText"
          @row-click="handleSelect"
        >
          <!-- 부모가 정의한 #cell-* 슬롯을 DataTable 로 그대로 전달 -->
          <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps" />
          </template>
        </DataTable>
      </div>

      <Pagination
        v-if="data"
        :page="page"
        :total-pages="data.totalPages"
        :block-size="5"
        @change="(p: number) => (page = p)"
      />
    </div>
  </Modal>
</template>
