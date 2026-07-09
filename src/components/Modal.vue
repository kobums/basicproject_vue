<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    closeOnBackdrop?: boolean // 배경 클릭 시 닫기 (기본 true)
  }>(),
  { closeOnBackdrop: true },
)

const emit = defineEmits<{ close: [] }>()

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// ESC 로 닫기 + 열려 있는 동안 배경 스크롤 잠금
let prevOverflow = ''

function lock() {
  document.addEventListener('keydown', onKeyDown)
  prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlock() {
  document.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = prevOverflow
}

watch(
  () => props.open,
  (open) => {
    if (open) lock()
    else unlock()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (props.open) unlock()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop">
      <!-- 배경 클릭으로 닫기: role 꼼수 대신 실제 button 을 깔아 키보드 접근성 확보 -->
      <button
        v-if="closeOnBackdrop"
        type="button"
        class="modal-backdrop-button"
        aria-label="닫기"
        @click="emit('close')"
      />
      <dialog class="modal" open aria-modal="true" :aria-label="title">
        <header v-if="title" class="modal-header">
          <h2>{{ title }}</h2>
          <button
            type="button"
            class="modal-close"
            aria-label="닫기"
            @click="emit('close')"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div class="modal-body"><slot /></div>

        <footer class="modal-footer">
          <!-- footer 슬롯이 없으면 닫기 버튼만 -->
          <slot name="footer">
            <button type="button" class="btn" @click="emit('close')">
              닫기
            </button>
          </slot>
        </footer>
      </dialog>
    </div>
  </Teleport>
</template>
