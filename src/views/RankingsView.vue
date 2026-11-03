<script setup>
import { computed, ref } from 'vue'
import { formatGames, itemIcon, SAMPLE_TIER_META } from '../composables/useData'

const props = defineProps({
  augments: { type: Array, default: () => [] },
  builds: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  champions: { type: Array, default: () => [] },
  meta: { type: Object, default: null },
})

const emit = defineEmits(['back'])

const tab = ref('augments')

/** 装备字典，用于把 builds 里的装备 ID 还原成名称 */
const itemMap = computed(() => {
  const m = new Map()
  for (const it of props.items) m.set(it.id, it)
  return m
})

/** 海克斯榜：默认按全局胜率，可切换按覆盖面 */
const augSort = ref('winRate')
/** 只显示「进入过某个英雄前 10 推荐」的海克斯 */
const onlyCovered = ref(true)

const augmentRows = computed(() => {
  let list = [...props.augments]
  if (onlyCovered.value) list = list.filter((a) => (a.coverageHeroCount ?? 0) > 0)
  if (augSort.value === 'coverage') {
    list.sort((a, b) => (b.coverageHeroCount ?? 0) - (a.coverageHeroCount ?? 0))
  } else if (augSort.value === 'games') {
    list.sort((a, b) => (b.estGames ?? 0) - (a.estGames ?? 0))
  } else {
    list.sort((a, b) => (b.globalWinRate ?? 0) - (a.globalWinRate ?? 0))
  }
  return list
})

/** 未进入任何英雄推荐的海克斯数量，用于提示 */
const uncoveredCount = computed(
  () => props.augments.filter((a) => (a.coverageHeroCount ?? 0) === 0).length,
)

/** 英雄字典，用于出装榜显示是哪个英雄的方案 */
const champMap = computed(() => {
  const m = new Map()
  for (const c of props.champions) m.set(c.id, c)
  return m
})

/**
 * 出装榜：把「英雄 × 出装」扁平化后按胜率排
 * 只保留场次达标的，避免低样本套路霸榜
 */
const buildRows = computed(() => {
  const rows = []
  for (const b of props.builds) {
    for (const bd of b.builds || []) {
      if (!bd.items?.length) continue
      rows.push({ ...bd, championId: b.championId })
    }
  }
  return rows
    .filter((r) => r.games != null && r.games >= 10000)
    .sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0))
    .slice(0, 60)
})

function champOf(id) {
  return champMap.value.get(id) || null
}

function itemName(id) {
  return itemMap.value.get(id)?.name || String(id)
}

function winTone(v) {
  if (v == null) return ''
  if (v >= 54) return 'tier-s'
  if (v >= 52) return 'tier-a'
  if (v >= 50) return 'tier-b'
  return 'tier-c'
}

function tierMeta(key) {
  return SAMPLE_TIER_META[key] || null
}
</script>

<template>
  <div class="rank-page">
    <header class="topbar">
      <button class="back" @click="emit('back')" aria-label="返回">
        <span class="chev">‹</span>
      </button>
      <div class="topbar-title">
        <span class="name">全局榜单</span>
        <span class="sub">当前版本横向对比</span>
      </div>
    </header>

    <div class="tabs">
      <button
        class="tab"
        :class="{ active: tab === 'augments' }"
        @click="tab = 'augments'"
      >
        海克斯榜
      </button>
      <button class="tab" :class="{ active: tab === 'builds' }" @click="tab = 'builds'">
        出装榜
      </button>
    </div>

    <!-- 海克斯榜 -->
    <section v-if="tab === 'augments'" class="block">
      <div class="block-head">
        <h2>强化符文强度排行</h2>
        <span class="block-note">{{ augmentRows.length }} 个</span>
      </div>

      <div class="sort-bar">
        <button
          v-for="s in [
            { key: 'winRate', label: '按胜率' },
            { key: 'coverage', label: '按覆盖面' },
            { key: 'games', label: '按场次' },
          ]"
          :key="s.key"
          class="sort-btn"
          :class="{ active: augSort === s.key }"
          @click="augSort = s.key"
        >
          {{ s.label }}
        </button>
        <button
          class="sort-btn toggle"
          :class="{ active: onlyCovered }"
          @click="onlyCovered = !onlyCovered"
        >
          {{ onlyCovered ? '仅看有覆盖' : '全部海克斯' }}
        </button>
      </div>

      <p v-if="onlyCovered && uncoveredCount" class="hint-line">
        另有 {{ uncoveredCount }} 个海克斯未进入任何英雄的前 10 推荐，已隐藏。
      </p>

      <ul class="rank-list">
        <li v-for="(a, i) in augmentRows" :key="a.name" class="rank-row">
          <span class="rank-no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <div class="rank-main">
            <div class="rank-title">
              <span class="rank-name">{{ a.name }}</span>
              <span class="rarity-tag" :class="'r-' + (a.rarity || '白银')">{{ a.rarity }}</span>
            </div>
            <div class="rank-metrics">
              <span class="metric">
                胜率 <b :class="winTone(a.globalWinRate)">{{ a.globalWinRate ?? '—' }}%</b>
              </span>
              <span class="metric">选取 <b>{{ a.pickRate ?? '—' }}%</b></span>
              <span v-if="a.coverageHeroCount" class="metric">
                覆盖 <b>{{ a.coverageHeroCount }}</b> 位英雄
              </span>
              <span v-else class="metric metric-none">
                未进入任何英雄的前 10 推荐
              </span>
              <span v-if="a.estGames" class="metric">合计 <b>≈{{ formatGames(a.estGames) }}</b></span>
            </div>
          </div>
          <div class="rank-score">
            <span class="score-num">{{ a.deepScore ?? '—' }}</span>
            <span class="score-label">DS</span>
          </div>
        </li>
      </ul>

      <p v-if="!augmentRows.length" class="empty">暂无海克斯数据</p>
    </section>

    <!-- 出装榜 -->
    <section v-else class="block">
      <div class="block-head">
        <h2>高胜率出装排行</h2>
        <span class="block-note">仅含场次 ≥ 1 万的方案</span>
      </div>

      <ul class="rank-list">
        <li v-for="(b, i) in buildRows" :key="i" class="rank-row build-row">
          <span class="rank-no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <div class="rank-main">
            <div class="build-head">
              <span v-if="champOf(b.championId)" class="build-champ">
                {{ champOf(b.championId).name }}
              </span>
              <div class="build-items">
                <div v-for="id in b.items" :key="id" class="bi">
                  <img :src="itemIcon(id)" :alt="itemName(id)" class="bi-icon" loading="lazy" />
                  <span class="bi-name ellipsis">{{ itemName(id) }}</span>
                </div>
              </div>
            </div>
            <div class="rank-metrics">
              <span class="metric">
                胜率 <b :class="winTone(b.winRate)">{{ b.winRate ?? '—' }}%</b>
              </span>
              <span class="metric">选取 <b>{{ b.pickRate ?? '—' }}%</b></span>
              <span class="metric">场次 <b>≈{{ formatGames(b.games) }}</b></span>
              <span v-if="tierMeta(b.sampleTier)" class="tier-tag" :style="{ color: tierMeta(b.sampleTier).color }">
                {{ tierMeta(b.sampleTier).label }}
              </span>
            </div>
          </div>
          <div class="rank-score">
            <span class="score-num">{{ b.score ?? '—' }}</span>
            <span class="score-label">DS</span>
          </div>
        </li>
      </ul>

      <p v-if="!buildRows.length" class="empty">暂无出装数据</p>
    </section>

    <footer class="foot">
      <p class="disclaimer">
        场次为「英雄场次 × 选取率」估算值，非逐条实测；胜率来自公开统计站点抽样，仅供参考。
      </p>
    </footer>
  </div>
</template>

<style scoped>
.rank-page {
  padding-bottom: calc(28px + var(--safe-bottom));
  max-width: 900px;
  margin: 0 auto;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: calc(8px + var(--safe-top)) 12px 8px;
  background: rgba(11, 16, 32, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}

.back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--panel);
  border: 1px solid var(--line);
  flex: 0 0 auto;
}

.chev {
  font-size: 22px;
  line-height: 1;
  color: var(--text);
  margin-top: -3px;
}

.topbar-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.name {
  font-size: 17px;
  font-weight: 700;
}

.sub {
  font-size: 12px;
  color: var(--text-faint);
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px 4px;
}

.tab {
  flex: 1;
  padding: 9px 0;
  border-radius: 10px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--text-dim);
  font-size: 14px;
  font-weight: 600;
}

.tab.active {
  background: var(--accent);
  border-color: transparent;
  color: #fff;
}

.block {
  padding: 12px 16px 0;
}

.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.block-head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.block-note {
  font-size: 11px;
  color: var(--text-faint);
}

.sort-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.sort-btn {
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--text-dim);
  font-size: 12px;
}

.sort-btn.active {
  background: var(--panel-2);
  color: var(--text);
  border-color: rgba(255, 255, 255, 0.18);
}

.sort-btn.toggle {
  margin-left: auto;
}

.sort-btn.toggle.active {
  background: var(--accent);
  border-color: transparent;
  color: #fff;
}

.hint-line {
  margin: 0 0 10px;
  font-size: 11px;
  color: var(--text-faint);
}

.metric-none {
  color: var(--text-faint);
  font-style: italic;
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.rank-no {
  flex: 0 0 auto;
  width: 22px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-faint);
}

.rank-no.top {
  color: var(--gold);
}

.rank-main {
  flex: 1 1 auto;
  min-width: 0;
}

.rank-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rarity-tag {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  border: 1px solid currentColor;
  opacity: 0.85;
}

.r-棱彩 {
  color: var(--prism);
}
.r-黄金 {
  color: var(--gold);
}
.r-白银 {
  color: var(--silver);
}

.rank-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-faint);
}

.metric b {
  color: var(--text-dim);
  font-weight: 600;
}

.rank-score {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 34px;
}

.score-num {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-2);
  line-height: 1.1;
}

.score-label {
  font-size: 9px;
  color: var(--text-faint);
}

.build-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.build-champ {
  flex: 0 0 auto;
  padding: 1px 7px;
  border-radius: 4px;
  background: var(--panel-2);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-dim);
}

.build-items {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.bi {
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 120px;
}

.bi-icon {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1px solid var(--line);
  flex: 0 0 auto;
}

.bi-name {
  font-size: 11px;
  color: var(--text-dim);
}

.tier-tag {
  font-size: 10px;
}

.tier-s {
  color: var(--good) !important;
}
.tier-a {
  color: #8ecfff !important;
}
.tier-b {
  color: var(--text-dim) !important;
}
.tier-c {
  color: #f08a8a !important;
}

.empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-faint);
}

.foot {
  padding: 18px 16px 0;
  text-align: center;
}

.disclaimer {
  margin: 0;
  font-size: 11px;
  color: var(--text-faint);
  line-height: 1.6;
}
</style>
