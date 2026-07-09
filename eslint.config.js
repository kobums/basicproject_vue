import css from '@eslint/css'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import sonarjs from 'eslint-plugin-sonarjs'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import tseslint from 'typescript-eslint'

export default defineConfig(
  { ignores: ['dist/**', 'node_modules/**'] },

  // JS / TS / Vue
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      pluginVue.configs['flat/recommended'],
      vueA11y.configs['flat/recommended'],
      sonarjs.configs.recommended,
    ],
    rules: {
      // Prettier 가 포맷을 담당하므로 스타일 규칙은 충돌 방지 차원에서 끈다
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/first-attribute-linebreak': 'off',
      // 단일 단어 컴포넌트명은 이 프로젝트의 컨벤션.
      // HTML 요소와 대소문자 무시 충돌하는 이름(Input/Select)만 Base* 로 개명해 해결했다.
      'vue/multi-word-component-names': 'off',
      // TS optional prop(`?:`)이면 undefined 기본값으로 충분하다
      'vue/require-default-prop': 'off',
      // 암묵적 연결(label 로 감싸기)도 유효한 HTML 이므로 nesting 또는 id 중 하나만 요구
      'vuejs-accessibility/label-has-for': [
        'error',
        { required: { some: ['nesting', 'id'] } },
      ],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },

  // CSS
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
    rules: {
      // 커스텀 프로퍼티(--bg 등)는 index.css :root 에 정의 — 파일 단위 검사라 못 보므로 허용
      'css/no-invalid-properties': ['error', { allowUnknownVariables: true }],
      // resize/user-select 같은 점진적 향상 속성 허용 (미지원 브라우저에선 무시될 뿐)
      'css/use-baseline': ['error', { available: 'newly' }],
    },
  },
)
