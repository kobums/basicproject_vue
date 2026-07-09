<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBoards } from '../composables/useBoards'
import Pagination from '../components/Pagination.vue'
import SearchBar from '../components/SearchBar.vue'
import PageHeader from '../components/PageHeader.vue'
import ListToolbar from '../components/ListToolbar.vue'
import DataTable, { type DataTableColumn } from '../components/DataTable.vue'
import { formatDateTime } from '../lib/format'

const {
  data,
  loading,
  error,
  page,
  setPage,
  size,
  changeSize,
  search,
  submitSearch,
} = useBoards()
const router = useRouter()

const isSearching = computed(() => search.value.keyword.trim().length > 0)

const resultInfo = computed(() => {
  if (!data.value) return ''
  return isSearching.value
    ? `‘${search.value.keyword.trim()}’ 검색 결과 ${data.value.totalElements}건`
    : `전체 ${data.value.totalElements}건`
})

const columns: DataTableColumn[] = [
  { key: 'id', header: '번호', width: '64px', align: 'center' },
  { key: 'title', header: '제목' },
  { key: 'author', header: '작성자', width: '110px' },
  { key: 'createdAt', header: '작성일', width: '140px' },
]
</script>

<template>
  <section class="page">
    <PageHeader title="게시판">
      <RouterLink class="btn btn-primary" to="/boards/new">글쓰기</RouterLink>
    </PageHeader>

    <SearchBar :value="search" @search="submitSearch" />

    <p v-if="loading" class="muted">불러오는 중…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="data && !loading">
      <ListToolbar :info="resultInfo" :size="size" @size-change="changeSize" />

      <DataTable
        :columns="columns"
        :data="data.content"
        :row-key="(board) => board.id"
        clickable
        :empty-text="
          isSearching ? '검색 결과가 없습니다.' : '등록된 글이 없습니다.'
        "
        @row-click="(board) => router.push(`/boards/${board.id}`)"
      >
        <template #cell-title="{ item }">
          <span class="title-text">{{ item.title ?? '(제목 없음)' }}</span>
          <!-- 첨부 이미지가 있는 글의 제목 옆에 붙이는 작은 아이콘 -->
          <svg
            v-if="item.imgUrl"
            class="title-img-icon"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-label="이미지 첨부"
            role="img"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </template>
        <template #cell-author="{ item }">
          {{ item.author.name ?? `#${item.author.id}` }}
        </template>
        <template #cell-createdAt="{ item }">
          <span class="muted">{{ formatDateTime(item.createdAt) }}</span>
        </template>
      </DataTable>

      <Pagination
        :page="page"
        :total-pages="data.totalPages"
        @change="setPage"
      />
    </template>
  </section>
</template>
