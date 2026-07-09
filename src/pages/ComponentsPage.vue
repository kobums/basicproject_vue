<script setup lang="ts">
import { computed, ref } from 'vue'
import PageTitle from '../components/PageTitle.vue'
import StatusBadge, { type BadgeVariant } from '../components/StatusBadge.vue'
import Tooltip from '../components/Tooltip.vue'
import Empty from '../components/Empty.vue'
import Spinner from '../components/Spinner.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'
import Dropdown from '../components/Dropdown.vue'
import Checkbox from '../components/Checkbox.vue'
import CheckboxGroup from '../components/CheckboxGroup.vue'
import RadioGroup from '../components/RadioGroup.vue'
import SearchInput from '../components/SearchInput.vue'
import Datepicker from '../components/Datepicker.vue'
import DateRangeFilter from '../components/DateRangeFilter.vue'
import DataTable, { type DataTableColumn } from '../components/DataTable.vue'
import SearchPickerModal from '../components/SearchPickerModal.vue'
import FilterSelect from '../components/FilterSelect.vue'
import FilterPanel from '../components/FilterPanel.vue'
import Tabs from '../components/Tabs.vue'
import Accordion from '../components/Accordion.vue'
import Alert from '../components/Alert.vue'
import Switch from '../components/Switch.vue'
import Chip from '../components/Chip.vue'
import ProgressBar from '../components/ProgressBar.vue'
import Skeleton from '../components/Skeleton.vue'
import Avatar from '../components/Avatar.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import Drawer from '../components/Drawer.vue'
import FileUpload from '../components/FileUpload.vue'
import Stepper from '../components/Stepper.vue'
import Card from '../components/Card.vue'
import MenuDropdown from '../components/MenuDropdown.vue'
import Combobox from '../components/Combobox.vue'
import TagInput from '../components/TagInput.vue'
import NumberInput from '../components/NumberInput.vue'
import Slider from '../components/Slider.vue'
import Rating from '../components/Rating.vue'
import SegmentedControl from '../components/SegmentedControl.vue'
import Timeline from '../components/Timeline.vue'
import DescriptionList from '../components/DescriptionList.vue'
import ImageLightbox from '../components/ImageLightbox.vue'
import CopyButton from '../components/CopyButton.vue'
import Calendar from '../components/Calendar.vue'
import Carousel from '../components/Carousel.vue'
import Tree from '../components/Tree.vue'
import PinInput from '../components/PinInput.vue'
import BottomSheet from '../components/BottomSheet.vue'
import AvatarGroup from '../components/AvatarGroup.vue'
import RangeSlider from '../components/RangeSlider.vue'
import TextClamp from '../components/TextClamp.vue'
import InfiniteScroll from '../components/InfiniteScroll.vue'
import BackToTop from '../components/BackToTop.vue'
import ListManager, {
  type ListManagerItem,
} from '../components/ListManager.vue'
import heroImg from '../assets/hero.png'
import { useLoading } from '../stores/loading'
import { useFeedback } from '../stores/feedback'
import { fetchUsers } from '../api/users'
import type { User } from '../types/user'

const notify = useFeedback()
const loading = useLoading()

// ---- DataTable 데모용 샘플 데이터 ----
interface DemoRow {
  id: number
  name: string
  role: string
  status: string
  joinedAt: string
}

const DEMO_ROWS: DemoRow[] = [
  {
    id: 1,
    name: '홍길동',
    role: '관리자',
    status: '활성',
    joinedAt: '2026-01-12',
  },
  {
    id: 2,
    name: '김영희',
    role: '편집자',
    status: '대기',
    joinedAt: '2026-03-02',
  },
  {
    id: 3,
    name: '이철수',
    role: '뷰어',
    status: '정지',
    joinedAt: '2026-05-21',
  },
]

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  활성: 'green',
  대기: 'blue',
  정지: 'red',
}

const demoColumns: DataTableColumn[] = [
  { key: 'id', header: '번호', width: '64px', align: 'center' },
  { key: 'name', header: '이름' },
  { key: 'role', header: '역할' },
  { key: 'status', header: '상태', width: '90px', align: 'center' },
  { key: 'joinedAt', header: '가입일', width: '120px' },
]

const userColumns: DataTableColumn[] = [
  { key: 'id', header: '번호', width: '64px', align: 'center' },
  { key: 'name', header: '이름' },
  { key: 'email', header: '이메일' },
]

// 폼 계열 상태
const text = ref('')
const memo = ref('')
const fruit = ref('apple')
const dropdownValue = ref<string | number | null>(null)
const agreed = ref(false)
const hobbies = ref<string[]>(['reading'])
const gender = ref('none')
const searchKeyword = ref('')
const date = ref('')
const rangeStart = ref('')
const rangeEnd = ref('')

// SearchPickerModal
const pickerOpen = ref(false)
const pickedUser = ref<User | null>(null)

// 신규 컴포넌트 데모 상태
const statusFilter = ref<string[]>([])
const filterName = ref('')
const filterStart = ref('')
const filterEnd = ref('')
const tab = ref('info')
const darkMode = ref(false)
const chips = ref(['React', 'Vue', 'Spring Boot'])
const progress = ref(35)
const drawerOpen = ref(false)
const uploadFiles = ref<File[]>([])
const step = ref(1)

// 2차 신규 컴포넌트 데모 상태
const combo = ref('')
const tags = ref<string[]>(['react', 'vue'])
const count = ref(3)
const volume = ref(40)
const stars = ref(3)
const view = ref('list')

function onMenuSelect(action: string) {
  if (action === 'delete') {
    notify({ type: 'error', message: '삭제 클릭' })
  } else {
    notify({
      type: 'success',
      message: `${action === 'edit' ? '수정' : '복제'} 클릭`,
    })
  }
}

function removeChip(chip: string) {
  chips.value = chips.value.filter((c) => c !== chip)
}

function detailSearch() {
  notify({
    type: 'success',
    message: `상세검색: 이름=${filterName.value || '(없음)'}, 기간=${filterStart.value || '?'}~${filterEnd.value || '?'}`,
  })
}

function resetDetail() {
  filterName.value = ''
  filterStart.value = ''
  filterEnd.value = ''
}

// 3차 신규 컴포넌트 데모 상태
const calDate = ref('')
const pin = ref('')
const sheetOpen = ref(false)
const rangeMin = ref(20)
const rangeMax = ref(70)
const feed = ref(Array.from({ length: 10 }, (_, i) => i + 1))
const feedLoading = ref(false)
const feedHasMore = computed(() => feed.value.length < 30)
const sort = ref<{ key: string; dir: 'asc' | 'desc' }>({
  key: 'id',
  dir: 'asc',
})

// 4차 신규 컴포넌트 데모 상태
const todos = ref<ListManagerItem[]>([
  { id: 1, label: '백로그 정리' },
  { id: 2, label: 'API 명세 작성' },
  { id: 3, label: '컴포넌트 데모 추가' },
  { id: 4, label: '코드 리뷰' },
])

function loadMoreFeed() {
  feedLoading.value = true
  // 실제로는 API 호출 — 데모는 500ms 지연 후 10개 추가
  setTimeout(() => {
    feed.value = [
      ...feed.value,
      ...Array.from({ length: 10 }, (_, i) => feed.value.length + i + 1),
    ]
    feedLoading.value = false
  }, 500)
}

function handleSort(key: string) {
  sort.value =
    sort.value.key === key
      ? { key, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' }
}

const sortedRows = computed(() =>
  [...DEMO_ROWS].sort((a, b) => {
    const av = String(a[sort.value.key as keyof DemoRow])
    const bv = String(b[sort.value.key as keyof DemoRow])
    const cmp = av.localeCompare(bv, 'ko', { numeric: true })
    return sort.value.dir === 'asc' ? cmp : -cmp
  }),
)

// 정렬 데모: 번호/이름/가입일만 정렬 가능으로 표시
const sortableColumns: DataTableColumn[] = demoColumns.map((col) => ({
  ...col,
  sortable: col.key === 'id' || col.key === 'name' || col.key === 'joinedAt',
}))

const fetchPickerUsers = (page: number, keyword: string) =>
  fetchUsers(page, keyword, 5)

function showLoadingDemo() {
  loading.show()
  setTimeout(loading.hide, 1500)
}

function handlePick(user: User) {
  pickedUser.value = user
  notify({ type: 'success', message: `${user.name ?? user.email} 선택됨` })
}
</script>

<template>
  <section class="page">
    <PageTitle
      title="컴포넌트"
      desc="blueprintsecurity 프론트의 공용 컴포넌트를 basicproject 스타일로 재구현한 데모."
      :kpis="[
        { label: '전체 컴포넌트', value: 55, accent: true },
        { label: '표시 계열', value: 28 },
        { label: '폼 계열', value: 21 },
        { label: '복합 계열', value: 6 },
      ]"
    />

    <div class="demo-section">
      <h2>StatusBadge</h2>
      <div class="demo-row">
        <StatusBadge label="허용" variant="green" />
        <StatusBadge label="거부" variant="red" />
        <StatusBadge label="미사용" variant="gray" />
        <StatusBadge label="검토중" variant="blue" />
        <StatusBadge label="S등급" variant="purple" />
      </div>
    </div>

    <div class="demo-section">
      <h2>Tooltip</h2>
      <div class="demo-row">
        <span>
          기본 아이콘 트리거
          <Tooltip text="ⓘ 아이콘에 마우스를 올리면 표시됩니다." />
        </span>
        <Tooltip text="커스텀 요소도 트리거가 될 수 있습니다.">
          <button type="button" class="btn btn-sm">hover me</button>
        </Tooltip>
      </div>
    </div>

    <div class="demo-section">
      <h2>Input / Select / Dropdown</h2>
      <div class="demo-grid">
        <BaseInput
          v-model="text"
          label="이름"
          placeholder="이름을 입력하세요"
          hint="최대 255자까지 입력할 수 있습니다."
        />
        <BaseInput
          model-value=""
          label="이메일 (에러 상태)"
          placeholder="user@example.com"
          error="이메일 형식이 올바르지 않습니다."
        />
        <BaseSelect
          v-model="fruit"
          label="과일 (네이티브 select)"
          :options="[
            { label: '사과', value: 'apple' },
            { label: '바나나', value: 'banana' },
            { label: '포도', value: 'grape' },
          ]"
        />
        <div class="field">
          <span>부서 (커스텀 Dropdown)</span>
          <Dropdown
            v-model="dropdownValue"
            placeholder="부서를 선택하세요"
            reset-label="전체"
            :options="[
              { label: '개발팀', value: 'dev' },
              { label: '디자인팀', value: 'design' },
              { label: '기획팀', value: 'plan' },
            ]"
          />
        </div>
      </div>
      <BaseInput
        v-model="memo"
        label="메모 (multiline)"
        multiline
        :rows="3"
        placeholder="여러 줄 입력"
      />
    </div>

    <div class="demo-section">
      <h2>Checkbox / CheckboxGroup / RadioGroup</h2>
      <div class="demo-row">
        <Checkbox id="agree" v-model="agreed" label="약관에 동의합니다" />
      </div>
      <div class="demo-row">
        <CheckboxGroup
          v-model="hobbies"
          name="hobby"
          :options="[
            { label: '독서', value: 'reading' },
            { label: '운동', value: 'workout' },
            { label: '게임', value: 'game' },
          ]"
        />
        <span class="demo-value">
          선택: <code>{{ JSON.stringify(hobbies) }}</code>
        </span>
      </div>
      <div class="demo-row">
        <RadioGroup
          v-model="gender"
          name="gender"
          :options="[
            { label: '선택 안 함', value: 'none' },
            { label: '남성', value: 'male' },
            { label: '여성', value: 'female' },
          ]"
        />
        <span class="demo-value">
          선택: <code>{{ gender }}</code>
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h2>SearchInput / Datepicker / DateRangeFilter</h2>
      <div class="demo-row">
        <SearchInput
          v-model="searchKeyword"
          @search="
            notify({ type: 'success', message: `'${searchKeyword}' 검색 실행` })
          "
        />
      </div>
      <div class="demo-grid">
        <Datepicker v-model="date" label="날짜" />
        <DateRangeFilter
          v-model:start="rangeStart"
          v-model:end="rangeEnd"
          label="조회 기간"
        />
      </div>
    </div>

    <div class="demo-section">
      <h2>DataTable</h2>
      <DataTable
        :columns="demoColumns"
        :data="DEMO_ROWS"
        :row-key="(row: DemoRow) => row.id"
        clickable
        @row-click="
          (row: DemoRow) =>
            notify({ type: 'success', message: `${row.name} 행 클릭` })
        "
      >
        <template #cell-status="{ item }">
          <StatusBadge
            :label="item.status"
            :variant="STATUS_VARIANT[item.status] ?? 'gray'"
          />
        </template>
      </DataTable>
    </div>

    <div class="demo-section">
      <h2>Empty</h2>
      <Empty text="검색 결과가 없습니다." />
    </div>

    <div class="demo-section">
      <h2>Spinner / LoadingOverlay</h2>
      <div class="demo-row">
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" />
        <button type="button" class="btn" @click="showLoadingDemo">
          전역 로딩 1.5초 표시
        </button>
      </div>
    </div>

    <div class="demo-section">
      <h2>SearchPickerModal</h2>
      <div class="demo-row">
        <button
          type="button"
          class="btn btn-primary"
          @click="pickerOpen = true"
        >
          회원 선택
        </button>
        <span v-if="pickedUser" class="demo-value">
          선택된 회원: <code>{{ pickedUser.name ?? pickedUser.email }}</code>
        </span>
      </div>
      <SearchPickerModal
        :open="pickerOpen"
        title="회원 선택"
        :fetch-items="fetchPickerUsers"
        :columns="userColumns"
        :row-key="(u: User) => u.id"
        placeholder="이름 또는 이메일로 검색"
        @close="pickerOpen = false"
        @select="handlePick"
      />
    </div>

    <div class="demo-section">
      <h2>FilterSelect / FilterPanel</h2>
      <div class="demo-row">
        <FilterSelect
          v-model="statusFilter"
          title="상태"
          :options="[
            { label: '활성', value: 'active' },
            { label: '대기', value: 'pending' },
            { label: '정지', value: 'banned' },
          ]"
        />
        <FilterPanel @reset="resetDetail" @search="detailSearch">
          <BaseInput v-model="filterName" label="이름" placeholder="이름" />
          <DateRangeFilter
            v-model:start="filterStart"
            v-model:end="filterEnd"
            label="기간"
          />
        </FilterPanel>
        <span class="demo-value">
          필터: <code>{{ JSON.stringify(statusFilter) }}</code>
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h2>Tabs</h2>
      <Tabs
        v-model="tab"
        :tabs="[
          { label: '정보', value: 'info' },
          { label: '설정', value: 'settings' },
          { label: '이력', value: 'history' },
        ]"
      />
      <p class="demo-value">
        현재 탭: <code>{{ tab }}</code>
      </p>
    </div>

    <div class="demo-section">
      <h2>Accordion</h2>
      <Accordion
        :default-open="[0]"
        :items="[
          {
            title: '이 프로젝트는 무엇인가요?',
            content:
              '학습용 풀스택 프로젝트입니다. Spring Boot + React + Vue 로 같은 기능을 구현합니다.',
          },
          {
            title: '백엔드 포트는?',
            content: '8081 입니다. 8080 은 다른 프로젝트가 사용 중입니다.',
          },
          {
            title: '상태 관리는?',
            content:
              '라이브러리 없이 Context(React)와 모듈 스코프 ref(Vue)로 직접 구현했습니다.',
          },
        ]"
      />
    </div>

    <div class="demo-section">
      <h2>Alert</h2>
      <div style="display: flex; flex-direction: column; gap: 10px">
        <Alert variant="info" title="안내">
          읽어 두면 좋은 정보성 메시지입니다.
        </Alert>
        <Alert variant="success">저장이 완료되었습니다.</Alert>
        <Alert variant="warning" title="주의">
          공유 DB이므로 스키마 변경에 주의하세요.
        </Alert>
        <Alert variant="error" title="오류" closable>
          요청 처리 중 문제가 발생했습니다. (닫기 가능)
        </Alert>
      </div>
    </div>

    <div class="demo-section">
      <h2>Switch / Chip</h2>
      <div class="demo-row">
        <Switch
          v-model="darkMode"
          :label="`다크 모드 ${darkMode ? 'ON' : 'OFF'}`"
        />
      </div>
      <div class="demo-row">
        <Chip
          v-for="chip in chips"
          :key="chip"
          :label="chip"
          accent
          removable
          @remove="removeChip(chip)"
        />
        <Chip label="삭제 불가 칩" />
        <button
          v-if="chips.length < 3"
          type="button"
          class="btn btn-sm"
          @click="chips = ['React', 'Vue', 'Spring Boot']"
        >
          칩 복원
        </button>
      </div>
    </div>

    <div class="demo-section">
      <h2>ProgressBar / Stepper</h2>
      <div style="display: flex; flex-direction: column; gap: 14px">
        <ProgressBar :value="progress" label="업로드 진행률" />
        <div class="demo-row">
          <button
            type="button"
            class="btn btn-sm"
            @click="progress = Math.max(0, progress - 15)"
          >
            -15
          </button>
          <button
            type="button"
            class="btn btn-sm"
            @click="progress = Math.min(100, progress + 15)"
          >
            +15
          </button>
        </div>
        <Stepper :steps="['정보 입력', '내용 확인', '완료']" :current="step" />
        <div class="demo-row">
          <button
            type="button"
            class="btn btn-sm"
            :disabled="step <= 0"
            @click="step -= 1"
          >
            이전 단계
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :disabled="step >= 2"
            @click="step += 1"
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>Skeleton / Avatar</h2>
      <div class="demo-row">
        <Skeleton circle width="40px" height="40px" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px">
          <Skeleton width="40%" />
          <Skeleton width="70%" />
        </div>
      </div>
      <div class="demo-row">
        <Avatar name="홍길동" size="sm" />
        <Avatar name="김영희" />
        <Avatar name="이철수" size="lg" />
        <Avatar name="Claude" />
      </div>
    </div>

    <div class="demo-section">
      <h2>Breadcrumb / Card</h2>
      <Breadcrumb
        :items="[
          { label: 'Home', to: '/' },
          { label: '회원', to: '/users' },
          { label: '컴포넌트' },
        ]"
      />
      <Card title="카드 제목">
        <template #extra>
          <StatusBadge label="NEW" variant="blue" />
        </template>
        헤더/본문/푸터로 구성된 카드 컨테이너입니다. 대시보드 위젯이나 요약 정보
        배치에 사용합니다.
        <template #footer>
          <button
            type="button"
            class="btn btn-primary"
            @click="notify({ type: 'success', message: '카드 액션 실행' })"
          >
            확인
          </button>
        </template>
      </Card>
    </div>

    <div class="demo-section">
      <h2>Drawer</h2>
      <button type="button" class="btn btn-primary" @click="drawerOpen = true">
        드로어 열기
      </button>
      <Drawer :open="drawerOpen" title="상세 정보" @close="drawerOpen = false">
        <p>
          오른쪽에서 슬라이드되어 나오는 패널입니다. 목록에서 행을 눌렀을 때
          페이지 이동 없이 상세를 보여주는 용도로 씁니다.
        </p>
        <p style="margin-top: 12px">ESC 또는 배경 클릭으로 닫힙니다.</p>
      </Drawer>
    </div>

    <div class="demo-section">
      <h2>FileUpload</h2>
      <FileUpload v-model="uploadFiles" accept="image/*" multiple />
    </div>

    <div class="demo-section">
      <h2>MenuDropdown / CopyButton</h2>
      <div class="demo-row">
        <MenuDropdown
          :items="[
            { label: '수정', action: 'edit' },
            { label: '복제', action: 'clone' },
            { label: '삭제', action: 'delete', danger: true, divider: true },
          ]"
          @select="onMenuSelect"
        />
        <CopyButton text="npm run dev" label="명령어 복사" />
        <code>npm run dev</code>
      </div>
    </div>

    <div class="demo-section">
      <h2>Combobox / TagInput</h2>
      <div class="demo-grid">
        <div class="field">
          <span>과일 자동완성</span>
          <Combobox
            v-model="combo"
            :options="[
              '사과',
              '바나나',
              '포도',
              '딸기',
              '수박',
              '복숭아',
              '파인애플',
            ]"
          />
        </div>
        <div class="field">
          <span>태그 (Enter 로 추가)</span>
          <TagInput v-model="tags" :max="5" />
          <small class="field-hint">
            선택: <code>{{ JSON.stringify(tags) }}</code>
          </small>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>NumberInput / Slider / Rating / SegmentedControl</h2>
      <div class="demo-row">
        <NumberInput v-model="count" :min="0" :max="10" />
        <span class="demo-value">
          수량: <code>{{ count }}</code>
        </span>
      </div>
      <div class="demo-row">
        <Slider v-model="volume" />
      </div>
      <div class="demo-row">
        <Rating v-model="stars" />
        <span class="demo-value">
          별점: <code>{{ stars }}</code>
        </span>
      </div>
      <div class="demo-row">
        <SegmentedControl
          v-model="view"
          :options="[
            { label: '목록', value: 'list' },
            { label: '카드', value: 'card' },
            { label: '달력', value: 'calendar' },
          ]"
        />
        <span class="demo-value">
          보기: <code>{{ view }}</code>
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h2>Timeline / DescriptionList</h2>
      <div class="demo-grid">
        <Timeline
          :items="[
            {
              title: '프로젝트 생성',
              time: '2026-06-28',
              description: 'Spring Boot + React 스캐폴드',
            },
            { title: 'JWT 인증 추가', time: '2026-06-29' },
            {
              title: 'Vue 포팅',
              time: '2026-07-05',
              description: 'basicproject_vue 생성',
            },
            { title: '배포', time: '예정', muted: true },
          ]"
        />
        <DescriptionList
          :items="[
            { label: '프로젝트', value: 'basicproject' },
            { label: '백엔드', value: 'Spring Boot (:8081)' },
            { label: '상태', value: '' },
          ]"
        >
          <template #value-상태>
            <StatusBadge label="진행중" variant="blue" />
          </template>
        </DescriptionList>
      </div>
    </div>

    <div class="demo-section">
      <h2>ImageLightbox</h2>
      <p class="demo-value">이미지를 클릭하면 크게 보기</p>
      <ImageLightbox img-class="img-preview" :src="heroImg" alt="샘플 이미지" />
    </div>

    <div class="demo-section">
      <h2>Calendar</h2>
      <div class="demo-row" style="align-items: flex-start">
        <Calendar v-model="calDate" />
        <span class="demo-value">
          선택: <code>{{ calDate || '(없음)' }}</code>
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h2>Carousel</h2>
      <Carousel
        :slides="[
          { src: heroImg, alt: '슬라이드 1' },
          { src: heroImg, alt: '슬라이드 2' },
          { src: heroImg, alt: '슬라이드 3' },
        ]"
      />
    </div>

    <div class="demo-section">
      <h2>Tree</h2>
      <Tree
        :nodes="[
          {
            label: 'src',
            children: [
              {
                label: 'components',
                children: [{ label: 'Modal.vue' }, { label: 'DataTable.vue' }],
              },
              { label: 'pages', children: [{ label: 'BoardListPage.vue' }] },
              { label: 'main.ts' },
            ],
          },
          { label: 'package.json' },
        ]"
        @select="
          (label: string) =>
            notify({ type: 'success', message: `${label} 선택` })
        "
      />
    </div>

    <div class="demo-section">
      <h2>PinInput</h2>
      <div class="demo-row">
        <PinInput v-model="pin" />
        <span class="demo-value">
          입력: <code>{{ pin || '(없음)' }}</code>
        </span>
      </div>
    </div>

    <div class="demo-section">
      <h2>BottomSheet</h2>
      <button type="button" class="btn btn-primary" @click="sheetOpen = true">
        바텀시트 열기
      </button>
      <BottomSheet
        :open="sheetOpen"
        title="옵션 선택"
        @close="sheetOpen = false"
      >
        <p>
          아래에서 올라오는 시트입니다. 모바일에서 모달 대신 자주 쓰는
          패턴입니다.
        </p>
        <div class="board-form-actions" style="margin-top: 16px">
          <button
            type="button"
            class="btn btn-primary"
            @click="sheetOpen = false"
          >
            확인
          </button>
        </div>
      </BottomSheet>
    </div>

    <div class="demo-section">
      <h2>AvatarGroup / RangeSlider</h2>
      <div class="demo-row">
        <AvatarGroup
          :names="['홍길동', '김영희', '이철수', 'Claude', '박민수', '최지우']"
        />
      </div>
      <div class="demo-row">
        <RangeSlider v-model:start="rangeMin" v-model:end="rangeMax" />
      </div>
    </div>

    <div class="demo-section">
      <h2>TextClamp</h2>
      <TextClamp
        :lines="2"
        text="basicproject 는 기본기 학습용 풀스택 프로젝트입니다. Spring Boot 백엔드 위에 React 와 Vue 로 같은 화면을 두 번 구현하면서 프레임워크 간 개념 대응을 익힙니다. 게시판 CRUD, JWT 인증, 파일 업로드, 검색과 페이징까지 실무에서 자주 쓰는 기능을 라이브러리 없이 직접 만들어 보고, 공용 컴포넌트 라이브러리도 처음부터 쌓아 올립니다. 이 문단은 TextClamp 데모를 위해 일부러 길게 작성되었습니다."
      />
    </div>

    <div class="demo-section">
      <h2>DataTable 정렬</h2>
      <p class="demo-value">번호/이름/가입일 헤더를 클릭하면 정렬됩니다.</p>
      <DataTable
        :columns="sortableColumns"
        :data="sortedRows"
        :row-key="(row: DemoRow) => row.id"
        :sort-key="sort.key"
        :sort-dir="sort.dir"
        @sort="handleSort"
      >
        <template #cell-status="{ item }">
          <StatusBadge
            :label="item.status"
            :variant="STATUS_VARIANT[item.status] ?? 'gray'"
          />
        </template>
      </DataTable>
    </div>

    <div class="demo-section">
      <h2>InfiniteScroll</h2>
      <p class="demo-value">
        아래로 스크롤하면 30개까지 자동으로 더 불러옵니다. (현재
        {{ feed.length }}개)
      </p>
      <InfiniteScroll
        :has-more="feedHasMore"
        :loading="feedLoading"
        @load-more="loadMoreFeed"
      >
        <ul class="file-list" data-testid="feed">
          <li v-for="n in feed" :key="n">피드 항목 #{{ n }}</li>
        </ul>
      </InfiniteScroll>
      <p v-if="!feedHasMore" class="muted">모두 불러왔습니다.</p>
    </div>

    <div class="demo-section">
      <h2>ListManager</h2>
      <p class="demo-value">
        드래그로 순서 변경, 검색으로 필터링, 하단 입력으로 추가, 체크박스로 선택
        후 일괄 삭제할 수 있습니다.
      </p>
      <ListManager v-model="todos" />
      <p class="demo-value">
        순서:
        <code>{{
          todos.map((t) => t.label).join(' → ') || '(비어 있음)'
        }}</code>
      </p>
    </div>

    <BackToTop />
  </section>
</template>
