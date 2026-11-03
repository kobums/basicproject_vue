<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBoard } from '../composables/useBoard'
import type { BoardSearchParams } from '../types/board'
import Pagination from '../components/Pagination.vue'
import SearchBar, {
  type SearchOption,
  type SearchValue,
} from '../components/SearchBar.vue'
import PageHeader from '../components/PageHeader.vue'
import ListToolbar from '../components/ListToolbar.vue'
import DataTable, { type DataTableColumn } from '../components/DataTable.vue'
import { formatDateTime, imageUrl } from '../lib/format'
import { errorMessage } from '../lib/errors'

// 생성 composable(useBoard) + 1-based 페이지. 작성자 이름은 조인 결과 extra.user 에 있다.
// board 는 read: "login" 이라 로그인 사용자는 모든 글을 본다 (수정 / 삭제는 작성자만).
const { items, total, loading, error, fetchPage } = useBoard()
const router = useRouter()

const page = ref(1)
const pagesize = ref(10)
// 검색은 생성 BoardSearchParams 의 필터 이름을 쓴다 (문자열 필터는 백엔드에서 부분 일치).
const SEARCH_OPTIONS: SearchOption[] = [
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
]
const search = ref<SearchValue>({ field: 'title', keyword: '' })

function load() {
  const params: BoardSearchParams = {
    page: page.value,
    pagesize: pagesize.value,
    orderby: 'id desc',
  }
  const keyword = search.value.keyword.trim()
  if (keyword) {
    Object.assign(params, { [search.value.field]: keyword })
  }
  void fetchPage(params)
}

// page/pagesize/search 가 바뀔 때마다 재조회. 같은 틱의 변경(검색+페이지 리셋)은 한 번으로 합쳐진다.
watch([page, pagesize, search], load, { immediate: true })

function submitSearch(next: SearchValue) {
  search.value = next
  page.value = 1
}

function changeSize(next: number) {
  pagesize.value = next
  page.value = 1
}

const isSearching = computed(() => search.value.keyword.trim().length > 0)

const resultInfo = computed(() =>
  isSearching.value
    ? `‘${search.value.keyword.trim()}’ 검색 결과 ${total.value}건`
    : `전체 ${total.value}건`,
)

const columns: DataTableColumn[] = [
  { key: 'id', header: '번호', width: '64px', align: 'center' },
  { key: 'title', header: '제목' },
  { key: 'author', header: '작성자', width: '110px' },
  { key: 'createddate', header: '작성일', width: '140px' },
]
</script>

<template>
  <section class="page">
    <PageHeader title="게시판">
      <RouterLink class="btn btn-primary" to="/boards/new">글쓰기</RouterLink>
    </PageHeader>

    <SearchBar
      :value="search"
      :options="SEARCH_OPTIONS"
      @search="submitSearch"
    />

    <p v-if="loading" class="muted">불러오는 중…</p>
    <p v-if="error" class="error">
      {{ errorMessage(error, '목록을 불러오지 못했습니다.') }}
    </p>

    <template v-if="!loading && !error">
      <ListToolbar
        :info="resultInfo"
        :size="pagesize"
        @size-change="changeSize"
      />

      <DataTable
        :columns="columns"
        :data="items"
        :row-key="(board) => board.id"
        clickable
        :empty-text="
          isSearching ? '검색 결과가 없습니다.' : '등록된 글이 없습니다.'
        "
        @row-click="(board) => router.push(`/boards/${board.id}`)"
      >
        <template #cell-title="{ item }">
          <span class="title-text">{{ item.title || '(제목 없음)' }}</span>
          <!-- 첨부 이미지가 있는 글의 제목 옆에 붙이는 작은 아이콘 -->
          <svg
            v-if="imageUrl(item.img)"
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
          {{ item.extra?.user?.name || `#${item.user}` }}
        </template>
        <template #cell-createddate="{ item }">
          <span class="muted">{{ formatDateTime(item.createddate) }}</span>
        </template>
      </DataTable>

      <Pagination
        :page="page"
        :total="total"
        :page-size="pagesize"
        @change="(p: number) => (page = p)"
      />
    </template>
  </section>
</template>
