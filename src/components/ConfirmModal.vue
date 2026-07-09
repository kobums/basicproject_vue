<script setup lang="ts">
import Modal from './Modal.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string // 확인 버튼 라벨 (진행 중엔 "<라벨> 중…" 으로 바뀜)
    busy?: boolean // 진행 중: 버튼 비활성 + 닫기 차단
    danger?: boolean // 삭제처럼 파괴적인 동작이면 빨간 버튼
  }>(),
  { confirmLabel: '확인', busy: false, danger: false },
)

const emit = defineEmits<{ close: []; confirm: [] }>()

// "취소 / 확인" footer 가 달린 확인 모달. 삭제 확인 등에 사용.
// 진행 중에는 ESC/배경 클릭으로도 닫히지 않게 한다.
function handleClose() {
  if (!props.busy) emit('close')
}
</script>

<template>
  <Modal :open="open" :title="title" @close="handleClose">
    <slot />
    <template #footer>
      <button type="button" class="btn" :disabled="busy" @click="handleClose">
        취소
      </button>
      <button
        type="button"
        :class="`btn ${danger ? 'btn-danger' : 'btn-primary'}`"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? `${confirmLabel} 중…` : confirmLabel }}
      </button>
    </template>
  </Modal>
</template>
