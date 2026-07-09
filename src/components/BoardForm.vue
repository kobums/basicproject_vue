<script lang="ts">
// 폼 제출 값 타입. <script setup> 은 export 를 허용하지 않아 일반 script 블록에서 내보낸다.
export interface BoardFormValues {
  title: string
  content: string
  image: File | null
}
</script>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import BaseInput from './BaseInput.vue'

const props = withDefaults(
  defineProps<{
    mode: 'create' | 'edit'
    initialTitle?: string
    initialContent?: string
    currentImgUrl?: string | null
    submitting: boolean
    fieldErrors?: Record<string, string>
  }>(),
  {
    initialTitle: '',
    initialContent: '',
    currentImgUrl: null,
    fieldErrors: () => ({}),
  },
)

const emit = defineEmits<{ submit: [values: BoardFormValues]; cancel: [] }>()

const fileInputId = useId()

const title = ref(props.initialTitle)
const content = ref(props.initialContent)
const image = ref<File | null>(null)

function handleFile(e: Event) {
  image.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function handleSubmit() {
  emit('submit', {
    title: title.value,
    content: content.value,
    image: image.value,
  })
}

// 중첩 삼항을 피하려 제출 버튼 라벨을 미리 계산
const actionLabel = computed(() => (props.mode === 'create' ? '등록' : '수정'))
</script>

<template>
  <form class="board-form" @submit.prevent="handleSubmit">
    <BaseInput
      v-model="title"
      label="제목"
      placeholder="제목을 입력하세요"
      :error="fieldErrors.title"
    />

    <BaseInput
      v-model="content"
      label="내용"
      multiline
      :rows="8"
      placeholder="내용을 입력하세요 (최대 255자)"
      :error="fieldErrors.content"
    />

    <div class="field">
      <label :for="fileInputId"
        >이미지{{
          mode === 'create' ? ' (선택)' : ' (변경 시에만 선택)'
        }}</label
      >
      <img
        v-if="mode === 'edit' && currentImgUrl"
        class="img-preview"
        :src="currentImgUrl"
        alt="현재 이미지"
      />
      <input
        :id="fileInputId"
        type="file"
        accept="image/*"
        @change="handleFile"
      />
      <small v-if="image" class="muted">선택됨: {{ image.name }}</small>
      <em v-if="fieldErrors.image" class="field-error">
        {{ fieldErrors.image }}
      </em>
    </div>

    <div class="board-form-actions">
      <button
        type="button"
        class="btn"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        취소
      </button>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? '저장 중…' : actionLabel }}
      </button>
    </div>
  </form>
</template>
