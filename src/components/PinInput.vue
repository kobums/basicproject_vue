<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string // 최대 length 자리 숫자 문자열
    length?: number
  }>(),
  { length: 6 },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 인증번호(OTP) 입력. 한 자리 치면 다음 칸으로, Backspace 는 이전 칸으로,
// 붙여넣기는 전체를 한 번에 채운다.
const refs = ref<(HTMLInputElement | null)[]>([])

function setDigit(index: number, digit: string) {
  const chars = props.modelValue.split('')
  while (chars.length < props.length) chars.push('') // 빈 칸 유지용 패딩
  chars[index] = digit
  emit('update:modelValue', chars.join('').slice(0, props.length))
}

function handleInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const digit = raw.replace(/\D/g, '').slice(-1) // 숫자만, 마지막 글자만
  ;(e.target as HTMLInputElement).value = digit
  setDigit(index, digit)
  if (digit && index < props.length - 1) refs.value[index + 1]?.focus()
}

function handleKeyDown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !props.modelValue[index] && index > 0) {
    refs.value[index - 1]?.focus()
    setDigit(index - 1, '')
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const digits = (e.clipboardData?.getData('text') ?? '')
    .replace(/\D/g, '')
    .slice(0, props.length)
  emit('update:modelValue', digits)
  refs.value[Math.min(digits.length, props.length - 1)]?.focus()
}
</script>

<template>
  <div class="pin-input" @paste="handlePaste">
    <input
      v-for="i in length"
      :key="i"
      :ref="(el) => (refs[i - 1] = el as HTMLInputElement | null)"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :class="modelValue[i - 1] ? 'filled' : ''"
      :value="modelValue[i - 1] ?? ''"
      :aria-label="`${i}번째 자리`"
      @input="handleInput(i - 1, $event)"
      @keydown="handleKeyDown(i - 1, $event)"
    />
  </div>
</template>
