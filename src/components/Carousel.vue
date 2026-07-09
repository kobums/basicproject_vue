<script lang="ts">
export interface CarouselSlide {
  src: string
  alt: string
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ slides: CarouselSlide[] }>()

// 좌우 화살표 + 점 인디케이터로 넘기는 이미지 캐러셀 (끝에서 순환).
const index = ref(0)

function go(next: number) {
  index.value = (next + props.slides.length) % props.slides.length
}
</script>

<template>
  <div class="carousel">
    <div
      class="carousel-track"
      :style="{ transform: `translateX(-${index * 100}%)` }"
    >
      <img
        v-for="slide in slides"
        :key="slide.src"
        :src="slide.src"
        :alt="slide.alt"
      />
    </div>

    <button
      type="button"
      class="carousel-arrow prev"
      aria-label="이전 슬라이드"
      @click="go(index - 1)"
    >
      ‹
    </button>
    <button
      type="button"
      class="carousel-arrow next"
      aria-label="다음 슬라이드"
      @click="go(index + 1)"
    >
      ›
    </button>

    <div class="carousel-dots">
      <button
        v-for="(slide, i) in slides"
        :key="slide.src"
        type="button"
        :class="i === index ? 'active' : ''"
        :aria-label="`${i + 1}번 슬라이드`"
        :aria-current="i === index"
        @click="go(i)"
      />
    </div>
  </div>
</template>
