<script lang="ts">
export interface OrgChartItem {
  id: number | string
  /** 상위 조직 id — 없거나 목록에 존재하지 않으면 루트로 취급 */
  parentId?: number | string | null
  name: string
  /** 노드 하단에 "N명"으로 표시할 인원 수 (선택) */
  count?: number
}

/**
 * 조직 구성도 그래프 — 자기참조(parentId) 평면 목록을 SVG 트리로 그린다.
 *
 * 큰 조직(수백 노드, 깊은 단계)에서도 읽히도록 "점진적 펼침"으로 동작한다:
 *  - 처음에는 루트 + 최상위 조직만 보이고, 노드를 클릭하면 하위가 펼쳐지며 선택된다.
 *  - 이미 선택된 노드를 다시 클릭하면 하위를 접고 선택을 해제한다.
 *  - 외부(목록 등)에서 선택되면 조상 사슬을 자동으로 펼쳐 노드를 드러낸다.
 *  - 접힌 노드는 하단 +N 배지로 숨어 있는 직계 하위 수를 보여준다.
 *
 * 레이아웃은 "보이는 노드"만으로 매번 다시 계산하고, viewBox 를 rAF 로 보간해
 * 카메라가 새 영역으로 부드럽게 이동한다 — 선택 시 부모+자신+하위로 줌 인,
 * 해제 시 전체 보기로 줌 아웃. (전체를 한 번에 그리면 가로 폭이 수만 px 가 되어
 * 글자가 보이지 않으므로, 펼쳐진 만큼만 그려 항상 읽히는 크기를 유지한다)
 */

const NODE_W = 152
const NODE_H = 48
const ROOT_H = 52
const GAP_X = 18
const GAP_Y = 50
const ROOT_GAP = 76
const PAD = 30
/** 포커스 줌 시 viewBox 최소 폭 — 너무 깊이 줌 돼 글자가 과도하게 커지는 것을 막는다 */
const MIN_VB_W = 540
const ANIM_MS = 520

type VB = [number, number, number, number]

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

interface GraphNode {
  key: string
  name: string
  isRoot: boolean
  parentKey: string | null
  childKeys: string[]
  count: number
}

interface Graph {
  byKey: Map<string, GraphNode>
  rootKeys: string[]
}

/** 평면 목록 → 연결 그래프 (좌표 없음 — 좌표는 펼침 상태에 따라 매번 계산) */
function buildGraph(items: OrgChartItem[]): Graph {
  const byKey = new Map<string, GraphNode>()

  items.forEach((it) => {
    const key = String(it.id)
    const parentKey =
      it.parentId != null && String(it.parentId) !== key ? String(it.parentId) : null
    byKey.set(key, {
      key,
      name: it.name,
      isRoot: false,
      parentKey,
      childKeys: [],
      count: it.count ?? 0,
    })
  })

  // 목록에 없는 부모를 가리키면 루트로 승격
  byKey.forEach((n) => {
    if (n.parentKey && !byKey.has(n.parentKey)) n.parentKey = null
  })

  // 순환 참조 방어: 조상 사슬에 자기 자신이 있으면 루트로 강등
  byKey.forEach((n) => {
    let cur = n.parentKey
    const seen = new Set([n.key])
    while (cur && byKey.has(cur)) {
      if (seen.has(cur)) {
        n.parentKey = null
        break
      }
      seen.add(cur)
      cur = byKey.get(cur)!.parentKey
    }
  })

  byKey.forEach((n) => {
    if (n.parentKey) byKey.get(n.parentKey)!.childKeys.push(n.key)
  })
  byKey.forEach((n) => {
    n.childKeys.sort((a, b) => byKey.get(a)!.name.localeCompare(byKey.get(b)!.name, 'ko'))
  })

  const rootKeys = [...byKey.values()]
    .filter((n) => !n.parentKey)
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    .map((n) => {
      n.isRoot = true
      return n.key
    })

  return { byKey, rootKeys }
}

interface GNode extends GraphNode {
  x: number // 중심 x
  y: number // 상단 y
  w: number
  h: number
  /** 접혀서 숨어 있는 직계 하위 수 (0이면 배지 없음) */
  hiddenKids: number
}

/** 펼쳐진(expanded) 노드의 하위만 그리는 tidy 레이아웃 */
function layoutVisible(graph: Graph, expanded: Set<string>): { nodes: GNode[]; bounds: VB } {
  const nodes: GNode[] = []
  let cursor = 0
  const place = (key: string, depth: number): GNode => {
    const g = graph.byKey.get(key)!
    const open = g.childKeys.length > 0 && expanded.has(key)
    const node: GNode = {
      ...g,
      x: 0,
      y: depth * (NODE_H + GAP_Y),
      w: NODE_W,
      h: g.isRoot ? ROOT_H : NODE_H,
      hiddenKids: open ? 0 : g.childKeys.length,
    }
    if (!open) {
      node.x = cursor + NODE_W / 2
      cursor += NODE_W + GAP_X
    } else {
      const kids = g.childKeys.map((c) => place(c, depth + 1))
      node.x = (kids[0].x + kids[kids.length - 1].x) / 2
    }
    nodes.push(node)
    return node
  }
  graph.rootKeys.forEach((k, i) => {
    if (i > 0) cursor += ROOT_GAP - GAP_X
    place(k, 0)
  })

  if (nodes.length === 0) return { nodes, bounds: [0, 0, 0, 0] }
  const minX = Math.min(...nodes.map((n) => n.x - n.w / 2)) - PAD
  const maxX = Math.max(...nodes.map((n) => n.x + n.w / 2)) + PAD
  const minY = Math.min(...nodes.map((n) => n.y)) - PAD
  const maxY = Math.max(...nodes.map((n) => n.y + n.h)) + PAD
  return { nodes, bounds: [minX, minY, maxX - minX, maxY - minY] }
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'

const props = withDefaults(
  defineProps<{
    items: OrgChartItem[]
    /** 현재 선택된 노드 키 (`String(id)`) — 없으면 전체 보기 */
    selectedKey?: string | null
  }>(),
  { selectedKey: null },
)

/** 노드 선택/해제 이벤트 (같은 노드 재클릭 시 null) */
const emit = defineEmits<{ select: [key: string | null] }>()

const graph = computed(() => buildGraph(props.items))
const expanded = ref<Set<string>>(new Set())

// 데이터가 바뀌면 기본 보기(루트 + 최상위 조직)로 리셋
watch(
  graph,
  (g) => {
    expanded.value = new Set(g.rootKeys)
  },
  { immediate: true },
)

// 외부 선택(목록 등) → 조상 사슬 + 자신을 펼쳐 노드를 드러낸다
watch(
  () => [props.selectedKey, graph.value] as const,
  ([key, g]) => {
    if (!key || !g.byKey.has(key)) return
    const need: string[] = []
    const self = g.byKey.get(key)!
    if (self.childKeys.length > 0) need.push(key)
    let cur = self.parentKey
    while (cur && g.byKey.has(cur)) {
      need.push(cur)
      cur = g.byKey.get(cur)!.parentKey
    }
    if (need.every((k) => expanded.value.has(k))) return
    const next = new Set(expanded.value)
    need.forEach((k) => next.add(k))
    expanded.value = next
  },
)

const layout = computed(() => layoutVisible(graph.value, expanded.value))
const nodes = computed(() => layout.value.nodes)
const bounds = computed(() => layout.value.bounds)
const nodeMap = computed(() => new Map(nodes.value.map((n) => [n.key, n])))

const vb = ref<VB>(bounds.value)
let rafId: number | null = null
const svgRef = ref<SVGSVGElement | null>(null)
/** 드래그 팬 진행 상태 (pointerId + 마지막 클라이언트 좌표) */
let pan: { id: number; x: number; y: number } | null = null
/** 드래그로 실제 이동했는지 — 직후 클릭을 노드 선택으로 오인하지 않도록 */
let moved = false

const focusKey = computed(() =>
  props.selectedKey && nodeMap.value.has(props.selectedKey) ? props.selectedKey : null,
)

// 포커스: 상위 조직 하나 + 자신 + (펼쳐져 있는) 직계 하위들만
const visible = computed(() => {
  if (!focusKey.value) return null
  const f = nodeMap.value.get(focusKey.value)!
  const keys = new Set<string>([f.key])
  f.childKeys.forEach((k) => {
    if (nodeMap.value.has(k)) keys.add(k)
  })
  if (f.parentKey && nodeMap.value.has(f.parentKey)) keys.add(f.parentKey)
  return keys
})

function animateTo(target: VB) {
  if (target.some((v) => !Number.isFinite(v))) return
  if (rafId) cancelAnimationFrame(rafId)
  const from = [...vb.value] as VB
  // 초기(빈 데이터) 좌표가 유효하지 않으면 보간 없이 즉시 이동 — Infinity 보간 시 NaN 고착 방지
  if (from.some((v) => !Number.isFinite(v))) {
    vb.value = target
    return
  }
  const t0 = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / ANIM_MS)
    const e = easeInOutCubic(t)
    vb.value = from.map((v, i) => v + (target[i] - v) * e) as VB
    if (t < 1) rafId = requestAnimationFrame(step)
  }
  rafId = requestAnimationFrame(step)
}

// 레이아웃·포커스 변경 → 카메라 이동 (포커스: 부모+자신+하위 bbox / 아니면 전체)
watch(
  () => [visible.value, nodes.value, bounds.value] as const,
  ([vis, ns, bs]) => {
    let target: VB = bs
    if (vis) {
      const vs = ns.filter((n) => vis.has(n.key))
      if (vs.length > 0) {
        const minX = Math.min(...vs.map((n) => n.x - n.w / 2)) - PAD
        const maxX = Math.max(...vs.map((n) => n.x + n.w / 2)) + PAD
        const minY = Math.min(...vs.map((n) => n.y)) - PAD
        const maxY = Math.max(...vs.map((n) => n.y + n.h)) + PAD
        let w = maxX - minX
        let x = minX
        if (w < MIN_VB_W) {
          x -= (MIN_VB_W - w) / 2
          w = MIN_VB_W
        }
        target = [x, minY, w, maxY - minY]
      }
    }
    animateTo(target)
  },
)

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})

/** 수동 확대/축소 — cx,cy(viewBox 좌표) 기준, 없으면 화면 중심. 자동 카메라 애니메이션은 중단 */
function zoomBy(factor: number, cx?: number, cy?: number) {
  if (rafId) cancelAnimationFrame(rafId)
  const [x, y, w, h] = vb.value
  if (![x, y, w, h].every(Number.isFinite)) return
  const minW = 300 // 최대 확대 한계
  const maxW = Math.max(bounds.value[2] * 1.6, 1200) // 최대 축소 한계
  const nw = Math.min(maxW, Math.max(minW, w * factor))
  const s = nw / w
  const fx = cx ?? x + w / 2
  const fy = cy ?? y + h / 2
  vb.value = [fx - (fx - x) * s, fy - (fy - y) * s, nw, h * s]
}

// ⌘/Ctrl+휠(트랙패드 핀치 포함) → 커서 기준 줌. 일반 휠은 페이지 스크롤에 양보.
// 템플릿 이벤트로는 passive: false 를 지정할 수 없어 직접 등록한다.
watchEffect((onCleanup) => {
  const el = svgRef.value
  if (!el) return
  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const [x, y, w, h] = vb.value
    if (![x, y, w, h].every(Number.isFinite)) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return // 0-크기 rect → NaN 좌표 오염 방지
    const s = Math.min(rect.width / w, rect.height / h) // preserveAspectRatio 'meet' 스케일
    const offX = (rect.width - w * s) / 2
    const offY = (rect.height - h * s) / 2
    const ux = x + (e.clientX - rect.left - offX) / s
    const uy = y + (e.clientY - rect.top - offY) / s
    zoomBy(Math.exp(e.deltaY * 0.0022), ux, uy)
  }
  el.addEventListener('wheel', onWheel, { passive: false })
  onCleanup(() => el.removeEventListener('wheel', onWheel))
})

/* — 드래그 팬 — */
function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  moved = false
  pan = { id: e.pointerId, x: e.clientX, y: e.clientY }
  // 주의: 여기서 setPointerCapture 를 걸면 click 이 svg 로 리타겟되어
  // 노드 클릭(선택/펼침)이 죽는다 — 실제 드래그 시작 시점에만 캡처한다
}
function onPointerMove(e: PointerEvent) {
  if (!pan || pan.id !== e.pointerId) return
  const el = e.currentTarget as SVGSVGElement
  const dx = e.clientX - pan.x
  const dy = e.clientY - pan.y
  if (!moved && Math.hypot(dx, dy) < 4) return // 미세 이동은 클릭으로 취급
  if (!moved) el.setPointerCapture(e.pointerId)
  moved = true
  if (rafId) cancelAnimationFrame(rafId)
  const [x, y, w, h] = vb.value
  if (![x, y, w, h].every(Number.isFinite)) return
  const rect = el.getBoundingClientRect()
  const s = Math.min(rect.width / w, rect.height / h)
  vb.value = [x - dx / s, y - dy / s, w, h]
  pan = { id: e.pointerId, x: e.clientX, y: e.clientY }
}
function onPointerUp(e: PointerEvent) {
  if (pan?.id === e.pointerId) pan = null
}

/** 부모 하단 → 자식 상단을 잇는 베지어 곡선 경로 */
function edgePath(n: GNode): string {
  const p = nodeMap.value.get(n.parentKey!)!
  const x1 = p.x
  const y1 = p.y + p.h
  const my = (y1 + n.y) / 2
  return `M ${x1} ${y1} C ${x1} ${my}, ${n.x} ${my}, ${n.x} ${n.y}`
}

const dimmed = (key: string) => (visible.value ? !visible.value.has(key) : false)
const label = (n: GNode) => (n.name.length > 10 ? `${n.name.slice(0, 10)}…` : n.name)

/** 재클릭 접기: 자신 + 모든 하위의 펼침 상태를 제거 */
function collapseSubtree(key: string) {
  const next = new Set(expanded.value)
  const stack = [key]
  while (stack.length) {
    const k = stack.pop()!
    next.delete(k)
    graph.value.byKey.get(k)?.childKeys.forEach((c) => stack.push(c))
  }
  expanded.value = next
}

function pick(key: string) {
  if (moved) return // 드래그 팬 직후의 클릭은 선택으로 처리하지 않음
  if (key === focusKey.value) {
    collapseSubtree(key)
    emit('select', null)
  } else {
    const g = graph.value.byKey.get(key)
    if (g && g.childKeys.length > 0 && !expanded.value.has(key)) {
      expanded.value = new Set(expanded.value).add(key)
    }
    emit('select', key)
  }
}

function resetAll() {
  emit('select', null)
  expanded.value = new Set(graph.value.rootKeys)
  // 상태 변화가 없어도(이미 기본 보기) 수동 줌/팬을 전체 보기로 되돌린다
  animateTo(bounds.value)
}

const shownVb = computed(() => (vb.value.every((v) => Number.isFinite(v)) ? vb.value : bounds.value))
</script>

<template>
  <div v-if="nodes.length === 0" class="empty">
    <p>조직 정보가 없습니다</p>
  </div>
  <div v-else class="org-wrap">
    <div class="org-tools">
      <button type="button" class="btn btn-sm" aria-label="확대" @click="zoomBy(1 / 1.4)">
        ＋
      </button>
      <button type="button" class="btn btn-sm" aria-label="축소" @click="zoomBy(1.4)">－</button>
      <button type="button" class="btn btn-sm" @click="resetAll">전체</button>
    </div>
    <svg
      ref="svgRef"
      class="org-svg"
      :viewBox="`${shownVb[0]} ${shownVb[1]} ${shownVb[2]} ${shownVb[3]}`"
      preserveAspectRatio="xMidYMid meet"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <defs>
        <filter id="org-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#191f28" flood-opacity="0.10" />
        </filter>
      </defs>
      <template v-for="n in nodes" :key="`e-${n.key}`">
        <path
          v-if="n.parentKey && nodeMap.has(n.parentKey)"
          class="org-edge"
          :class="{
            dim: dimmed(n.key) || dimmed(n.parentKey),
            on: !!visible && visible.has(n.key) && visible.has(n.parentKey),
          }"
          :d="edgePath(n)"
        />
      </template>
      <g
        v-for="n in nodes"
        :key="n.key"
        class="org-node"
        :class="{ dim: dimmed(n.key), sel: n.key === focusKey }"
        :transform="`translate(${n.x - n.w / 2}, ${n.y})`"
        role="button"
        tabindex="0"
        :aria-label="n.name"
        @click="pick(n.key)"
        @keydown.enter.prevent="pick(n.key)"
        @keydown.space.prevent="pick(n.key)"
      >
        <title>
          {{ n.name }}{{ n.hiddenKids > 0 ? ` — 하위 ${n.hiddenKids}개 (클릭해 펼치기)` : '' }}
        </title>
        <rect
          :class="n.isRoot ? 'org-root' : 'org-box'"
          :width="n.w"
          :height="n.h"
          :rx="12"
          filter="url(#org-shadow)"
        />
        <text
          :class="n.isRoot ? 'org-root-tx' : 'org-box-tx'"
          :x="n.w / 2"
          :y="n.isRoot ? n.h / 2 : n.h / 2 - (n.count > 0 ? 7 : 0)"
          dominant-baseline="central"
          text-anchor="middle"
        >
          {{ label(n) }}
        </text>
        <text
          v-if="!n.isRoot && n.count > 0"
          class="org-cnt-tx"
          :x="n.w / 2"
          :y="n.h / 2 + 12"
          dominant-baseline="central"
          text-anchor="middle"
        >
          {{ n.count }}명
        </text>
        <g v-if="n.hiddenKids > 0" class="org-more" :transform="`translate(${n.w / 2}, ${n.h})`">
          <rect :x="-17" :y="-9" :width="34" :height="18" :rx="9" />
          <text text-anchor="middle" dominant-baseline="central">+{{ n.hiddenKids }}</text>
        </g>
      </g>
    </svg>
    <div class="org-hint">⌘/Ctrl+스크롤 확대 · 드래그 이동</div>
  </div>
</template>
