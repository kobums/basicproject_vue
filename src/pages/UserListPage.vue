<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '../composables/useUsers'
import Pagination from '../components/Pagination.vue'
import PageHeader from '../components/PageHeader.vue'
import ListToolbar from '../components/ListToolbar.vue'
import DataTable, { type DataTableColumn } from '../components/DataTable.vue'
import { formatDateTime } from '../lib/format'

const { data, loading, error, page, setPage, size, changeSize, keyword } =
  useUsers()
const router = useRouter()

const isSearching = computed(() => keyword.value.trim().length > 0)

const resultInfo = computed(() => {
  if (!data.value) return ''
  return isSearching.value
    ? `‘${keyword.value.trim()}’ 검색 결과 ${data.value.totalElements}명`
    : `전체 ${data.value.totalElements}명`
})

const columns: DataTableColumn[] = [
  { key: 'id', header: '번호', width: '64px', align: 'center' },
  { key: 'email', header: '이메일' },
  { key: 'name', header: '이름', width: '110px' },
  { key: 'createdAt', header: '가입일', width: '140px' },
]
</script>

<template>
  <section class="page">
    <PageHeader title="회원">
      <RouterLink class="btn btn-primary" to="/users/new">회원 추가</RouterLink>
    </PageHeader>

    <search class="search-bar">
      <input
        v-model="keyword"
        class="search-input"
        type="search"
        placeholder="이름 또는 이메일로 검색"
        aria-label="회원 검색"
      />
    </search>

    <p v-if="loading && !data" class="muted">불러오는 중…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="data">
      <ListToolbar :info="resultInfo" :size="size" @size-change="changeSize" />

      <DataTable
        :columns="columns"
        :data="data.content"
        :row-key="(user) => user.id"
        clickable
        :empty-text="
          isSearching ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'
        "
        @row-click="(user) => router.push(`/users/${user.id}`)"
      >
        <template #cell-name="{ item }">{{ item.name ?? '-' }}</template>
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
