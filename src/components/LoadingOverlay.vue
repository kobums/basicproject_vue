<script setup lang="ts">
import { useLoadingStore } from '../stores/loading'
import Spinner from './Spinner.vue'

// 앱 전역 로딩 오버레이. App.vue 에 한 번만 두고, 페이지에서는 useLoadingStore() 의 show/hide 호출.
const loading = useLoadingStore()
</script>

<template>
  <Teleport to="body">
    <div v-if="loading.visible" class="loading-overlay" aria-busy="true">
      <Spinner size="lg" />
    </div>
  </Teleport>
</template>
