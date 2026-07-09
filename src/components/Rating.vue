<script setup lang="ts">
import { useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number // 0~max
    max?: number
    readonly?: boolean
  }>(),
  { max: 5, readonly: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

// 네이티브 라디오 그룹으로 구현 (키보드 방향키 탐색 무료 제공).
// name 은 페이지에 여러 Rating 이 있어도 안 섞이게 인스턴스별 고유값.
const groupName = useId()

// 별점 입력/표시. 같은 별을 다시 누르면 0점으로 해제된다.
function pick(star: number) {
  if (props.readonly) return
  emit('update:modelValue', star === props.modelValue ? 0 : star)
}
</script>

<template>
  <div :class="`rating${readonly ? ' readonly' : ''}`">
    <label
      v-for="star in max"
      :key="star"
      :class="star <= modelValue ? 'filled' : ''"
    >
      <input
        type="radio"
        :name="groupName"
        :value="star"
        :checked="star === modelValue"
        :disabled="readonly"
        :aria-label="`${star}점`"
        @click="pick(star)"
      />
      <span aria-hidden="true">★</span>
    </label>
  </div>
</template>
