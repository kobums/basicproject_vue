<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '../composables/useUser'
import type { UserSearchParams } from '../types/user'
import Pagination from '../components/Pagination.vue'
import SearchBar, {
  type SearchOption,
  type SearchValue,
} from '../components/SearchBar.vue'
import PageHeader from '../components/PageHeader.vue'
import ListToolbar from '../components/ListToolbar.vue'
import DataTable, { type DataTableColumn } from '../components/DataTable.vue'
import { formatDateTime } from '../lib/format'
import { errorMessage } from '../lib/errors'

// 생성 composable(useUser) + 1-based 페이지.
const { items, total, loading, error, fetchPage } = useUser()
const router = useRouter()

const page = ref(1)
const pagesize = ref(10)
// 생성 UserSearchParams 의 필터 이름 (name 은 정확히 일치, email 은 Go 에서 like 라 % 를 쓸 수 있다)
const SEARCH_OPTIONS: SearchOption[] = [
  { value: 'name', label: '이름' },
  { value: 'email', label: '이메일' },
]
const search = ref<SearchValue>({ field: 'name', keyword: '' })

function load() {
  const params: UserSearchParams = {
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
    ? `‘${search.value.keyword.trim()}’ 검색 결과 ${total.value}명`
    : `전체 ${total.value}명`,
)

const columns: DataTableColumn[] = [
  { key: 'id', header: '번호', width: '64px', align: 'center' },
  { key: 'email', header: '이메일' },
  { key: 'name', header: '이름', width: '110px' },
  { key: 'createddate', header: '가입일', width: '140px' },
]
</script>

<template>
  <section class="page">
    <PageHeader title="회원">
      <RouterLink class="btn btn-primary" to="/users/new">회원 추가</RouterLink>
    </PageHeader>

    <SearchBar
      :value="search"
      :options="SEARCH_OPTIONS"
      @search="submitSearch"
    />

    <p v-if="loading" class="muted">불러오는 중…</p>
    <p v-if="error" class="error">
      {{ errorMessage(error, '회원 목록을 불러오지 못했습니다.') }}
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
        :row-key="(user) => user.id"
        clickable
        :empty-text="
          isSearching ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'
        "
        @row-click="(user) => router.push(`/users/${user.id}`)"
      >
        <template #cell-name="{ item }">{{ item.name || '-' }}</template>
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
