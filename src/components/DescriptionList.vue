<script lang="ts">
export interface DescriptionItem {
  label: string
  value: string
}
</script>

<script setup lang="ts">
defineProps<{ items: DescriptionItem[] }>()

// "라벨: 값" 쌍을 표 형태로 나열하는 상세 정보 목록 (회원 상세 등).
// 스타일은 board.css 의 .detail-fields 를 재사용한다.
// 문자열 대신 커스텀 렌더가 필요하면 #value-<label> 슬롯 사용.
</script>

<template>
  <dl class="detail-fields">
    <div v-for="item in items" :key="item.label">
      <dt>{{ item.label }}</dt>
      <dd>
        <slot :name="`value-${item.label}`" :item="item">
          {{ item.value }}
        </slot>
      </dd>
    </div>
  </dl>
</template>
