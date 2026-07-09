<script lang="ts">
// 컬럼 정의. 셀 커스텀은 #cell-<key> 스코프드 슬롯으로 한다.
export interface DataTableColumn {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean // 헤더 클릭으로 정렬 (sort 이벤트 필요)
}

export type SortDir = 'asc' | 'desc'
</script>

<script setup lang="ts" generic="T">
const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    data: T[]
    rowKey: (item: T) => string | number
    clickable?: boolean // true 면 행 클릭 시 rowClick 이벤트 발생
    emptyText?: string
    // 정렬 상태는 부모가 소유 (서버 정렬/로컬 정렬 모두 대응)
    sortKey?: string
    sortDir?: SortDir
  }>(),
  { clickable: false, emptyText: '데이터가 없습니다.' },
)

const emit = defineEmits<{ rowClick: [item: T]; sort: [key: string] }>()

function handleHeaderClick(col: DataTableColumn) {
  if (col.sortable) emit('sort', col.key)
}

// 정렬 중인 컬럼만 aria-sort 값을 준다 (중첩 삼항 대신 헬퍼로 분리)
function ariaSort(
  col: DataTableColumn,
): 'ascending' | 'descending' | undefined {
  if (props.sortKey !== col.key) return undefined
  return props.sortDir === 'asc' ? 'ascending' : 'descending'
}

function thClass(col: DataTableColumn): string | undefined {
  const cls = [alignClass(col), col.sortable ? 'sortable' : '']
    .filter(Boolean)
    .join(' ')
  return cls || undefined
}

function cellValue(item: T, key: string): string {
  const value = (item as Record<string, unknown>)[key]
  if (value == null) return '-'
  if (typeof value === 'string') return value
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value)
  }
  // 원시값이 아닌 컬럼은 #cell-<key> 슬롯으로 그려야 한다. 방어적으로 JSON 표시.
  return JSON.stringify(value)
}

function alignClass(col: DataTableColumn): string | undefined {
  return col.align && col.align !== 'left' ? `cell-${col.align}` : undefined
}

function handleRowClick(item: T) {
  if (props.clickable) emit('rowClick', item)
}
</script>

<template>
  <table class="board-table data-table">
    <thead>
      <tr>
        <th
          v-for="col in columns"
          :key="col.key"
          :class="thClass(col)"
          :style="col.width ? { width: col.width } : undefined"
          :aria-sort="ariaSort(col)"
          @click="handleHeaderClick(col)"
        >
          {{ col.header }}
          <span
            v-if="sortKey === col.key"
            class="sort-arrow"
            aria-hidden="true"
          >
            {{ sortDir === 'asc' ? '▲' : '▼' }}
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="data.length === 0">
        <td class="cell-center muted" :colspan="columns.length">
          {{ emptyText }}
        </td>
      </tr>
      <template v-else>
        <tr
          v-for="item in data"
          :key="rowKey(item)"
          :class="{ 'row-clickable': clickable }"
          @click="handleRowClick(item)"
        >
          <td v-for="col in columns" :key="col.key" :class="alignClass(col)">
            <!-- #cell-<key> 슬롯이 있으면 커스텀 렌더, 없으면 item[key] 표시 -->
            <slot :name="`cell-${col.key}`" :item="item">
              {{ cellValue(item, col.key) }}
            </slot>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
