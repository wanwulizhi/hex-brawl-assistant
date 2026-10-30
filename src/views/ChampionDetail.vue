<script setup>
import { computed } from 'vue'
import { championIcon, groupMeta, ROLE_LABEL, RARITY_META } from '../composables/useData'

const props = defineProps({
  champion: { type: Object, required: true },
  build: { type: Object, default: null },
  itemMap: { type: Map, required: true },
})

const emit = defineEmits(['back'])

const augments = computed(() => (props.build?.augments || []).slice())
const coreItems = computed(() =>
  (props.build?.core || []).map((id) => props.itemMap.get(id)).filter(Boolean),
)
const buildList = computed(() => props.build?.builds || [])

/** 该英雄的强度分组 */
const group = computed(() => groupMeta(props.champion.group, props.champion.winRate))

const roleText = computed(() =>
  props.champion.roles.map((r) => ROLE_LABEL[r]).filter(Boolean).join(' / '),
)

/** 属性条（0-10 归一化） */
const statBars = computed(() => [
  { label: '攻击', value: props.champion.damage },
  { label: '防御', value: props.champion.defense },
  { label: '法术', value: props.champion.magic },
  { label: '难度', value: props.champion.difficulty },
])

/** 稀有度展示顺序：棱彩 → 黄金 → 白银 */
const RARITY_ORDER = ['棱彩', '黄金', '白银']

/**
 * 按稀有度分组后的海克斯列表
 * 组内仍按 DeepScore 降序（DS 已跨稀有度校准，可直接比较强度）
 */
const augmentGroups = computed(() => {
  const buckets = new Map(RARITY_ORDER.map((r) => [r, []]))
  for (const a of augments.value) {
    const key = buckets.has(a.rarity) ? a.rarity : '白银'
    buckets.get(key).push(a)
  }
  return RARITY_ORDER.map((r) => ({
    rarity: r,
    meta: RARITY_META[r],
    list: buckets.get(r).sort((x, y) => (y.score ?? 0) - (x.score ?? 0)),
  })).filter((g) => g.list.length > 0)
})

function itemName(id) {
  return props.itemMap.get(id)?.name || String(id)
}

function itemIcon(id) {
  return `https://game.gtimg.cn/images/lol/act/img/item/${id}.png`
}

function winTone(v) {
  if (v == null) return ''
  if (v >= 54) return 'tier-s'
  if (v >= 52) return 'tier-a'
  if (v >= 50) return 'tier-b'
  return 'tier-c'
}
</script>

<template>
  <div class="detail-page">
    <!-- 顶部条 -->
    <header class="topbar">
      <button class="back" @click="emit('back')" aria-label="返回">
        <span class="chev">‹</span>
      </button>
      <div class="topbar-title">
        <span class="name">{{ champion.name }}</span>
        <span class="sub">{{ champion.title }}</span>
      </div>
    </header>

    <!-- 英雄信息 -->
    <section class="hero-card">
      <img class="hero-avatar" :src="championIcon(champion.alias)" :alt="champion.name" />
      <div class="hero-meta">
        <p class="hero-name">{{ champion.name }}</p>
        <p class="hero-title">{{ champion.title }}</p>
        <div class="role-chips">
          <span v-for="r in champion.roles" :key="r" class="chip">{{ ROLE_LABEL[r] || r }}</span>
        </div>
      </div>
    </section>

    <!-- 强度与胜率 -->
    <section class="perf-card">
      <div class="perf-badge" :style="{ background: group.color }">{{ group.label }}</div>
      <div class="perf-main">
        <div class="perf-item">
          <span class="perf-value">{{ champion.winRate != null ? champion.winRate.toFixed(1) + '%' : '—' }}</span>
          <span class="perf-label">大乱斗胜率</span>
        </div>
        <div class="perf-item">
          <span class="perf-value">
            {{ champion.winRank != null ? '#' + champion.winRank : '—' }}
          </span>
          <span class="perf-label">胜率排名</span>
        </div>
        <div class="perf-item">
          <span class="perf-value">{{ champion.pickRate != null ? champion.pickRate.toFixed(1) + '%' : '—' }}</span>
          <span class="perf-label">选取率</span>
        </div>
      </div>
    </section>

    <section class="stat-row">
      <div v-for="s in statBars" :key="s.label" class="stat">
        <span class="stat-label">{{ s.label }}</span>
        <div class="bar">
          <div class="bar-fill" :style="{ width: `${(s.value / 10) * 100}%` }" />
        </div>
        <span class="stat-value">{{ s.value }}</span>
      </div>
    </section>

    <!-- 海克斯推荐（按稀有度分组） -->
    <section class="block">
      <div class="block-head">
        <h2>海克斯强化推荐</h2>
        <span class="block-note">按稀有度分组 · 组内按 DeepScore</span>
      </div>

      <div v-if="augments.length" class="rarity-groups">
        <div v-for="g in augmentGroups" :key="g.rarity" class="rarity-group">
          <div class="rarity-head">
            <i class="rarity-dot" :style="{ background: g.meta.color }" />
            <span class="rarity-name" :style="{ color: g.meta.color }">{{ g.rarity }}</span>
            <span class="rarity-count">{{ g.list.length }} 个</span>
          </div>

          <ul class="aug-list">
            <li v-for="(a, i) in g.list" :key="a.name" class="aug-item">
              <span class="aug-rank" :class="{ top: i === 0 }">{{ i + 1 }}</span>

              <div class="aug-main">
                <div class="aug-title-row">
                  <span class="aug-name">{{ a.name }}</span>
                </div>
                <p class="aug-en">{{ a.nameEn }}</p>
                <div class="aug-metrics">
                  <span class="metric">
                    胜率
                    <b :class="winTone(a.winRate)">{{
                      a.winRate != null ? a.winRate + '%' : '—'
                    }}</b>
                  </span>
                  <span class="metric">
                    选取 <b>{{ a.pickRate != null ? a.pickRate + '%' : '—' }}</b>
                  </span>
                </div>
              </div>

              <div class="aug-score">
                <span class="score-num">{{ a.score ?? '—' }}</span>
                <span class="score-label">DS</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <p v-else class="empty">暂无该英雄的海克斯数据</p>
    </section>

    <!-- 核心出装 -->
    <section class="block">
      <div class="block-head">
        <h2>核心出装</h2>
        <span class="block-note">大乱斗实测</span>
      </div>

      <div v-if="coreItems.length" class="core-flow">
        <div v-for="(it, i) in coreItems" :key="it.id" class="core-item">
          <img :src="itemIcon(it.id)" :alt="it.name" class="item-icon" loading="lazy" />
          <span class="item-name ellipsis">{{ it.name }}</span>
          <span v-if="i < coreItems.length - 1" class="flow-arrow">›</span>
        </div>
      </div>
      <p v-else class="empty">暂无出装数据</p>
    </section>

    <!-- 出装方案 -->
    <section class="block">
      <div class="block-head">
        <h2>高胜率出装方案</h2>
        <span class="block-note">{{ buildList.length }} 套</span>
      </div>

      <ul class="build-list">
        <li v-for="(b, i) in buildList" :key="i" class="build-row">
          <div class="build-items">
            <div v-for="id in b.items" :key="id" class="bi">
              <img :src="itemIcon(id)" :alt="itemName(id)" class="bi-icon" loading="lazy" />
              <span class="bi-name ellipsis">{{ itemName(id) }}</span>
            </div>
          </div>
          <div class="build-stats">
            <span class="bs" :class="winTone(b.winRate)">胜率 {{ b.winRate ?? '—' }}%</span>
            <span class="bs dim">选取 {{ b.pickRate ?? '—' }}%</span>
          </div>
        </li>
      </ul>
      <p v-if="!buildList.length" class="empty">暂无出装方案</p>
    </section>

    <footer class="detail-foot">
      <p>数据来自公开统计站点，仅供参考</p>
    </footer>
  </div>
</template>

<style scoped>
.detail-page {
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

.hero-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.hero-avatar {
  width: 76px;
  height: 76px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: var(--panel-2);
  flex: 0 0 auto;
}

.hero-meta {
  min-width: 0;
}

.hero-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.hero-title {
  margin: 2px 0 8px;
  font-size: 13px;
  color: var(--text-dim);
}

.role-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  color: var(--text-dim);
  background: var(--panel-2);
  border: 1px solid var(--line);
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 0 16px 18px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.stat-label {
  font-size: 11px;
  color: var(--text-faint);
}

.bar {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--panel-2);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
}

.stat-value {
  font-size: 11px;
  color: var(--text-dim);
}

/* ---- 强度与胜率 ---- */
.perf-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 16px 16px;
  padding: 12px 14px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 13px;
}

.perf-badge {
  flex: 0 0 auto;
  min-width: 46px;
  padding: 7px 11px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 800;
  color: #0b1020;
  text-align: center;
  letter-spacing: 1px;
}

.perf-main {
  display: flex;
  gap: 18px;
  flex: 1;
  min-width: 0;
}

.perf-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.perf-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.perf-label {
  font-size: 10px;
  color: var(--text-faint);
  white-space: nowrap;
}

.block {
  margin: 0 16px 22px;
}

.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.block-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.block-note {
  font-size: 11px;
  color: var(--text-faint);
}

/* ---- 按稀有度分组 ---- */
.rarity-groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.rarity-head {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  padding-left: 2px;
}

.rarity-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex: 0 0 auto;
}

.rarity-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.rarity-count {
  font-size: 11px;
  color: var(--text-faint);
}

.aug-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.aug-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.aug-rank {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-faint);
  background: var(--panel-2);
  flex: 0 0 auto;
}

.aug-rank.top {
  color: #0b1020;
  background: linear-gradient(135deg, var(--gold), #ffd873);
}

.aug-main {
  flex: 1;
  min-width: 0;
}

.aug-title-row {
  display: flex;
  align-items: baseline;
  gap: 7px;
  min-width: 0;
}

.aug-name {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aug-en {
  margin: 1px 0 5px;
  font-size: 10px;
  color: var(--text-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aug-metrics {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-faint);
}

.metric b {
  color: var(--text-dim);
  font-weight: 600;
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

.aug-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  min-width: 34px;
}

.score-num {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
}

.score-label {
  font-size: 9px;
  color: var(--text-faint);
  letter-spacing: 0.5px;
}

.core-flow {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.core-item {
  position: relative;
  flex: 0 0 auto;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.item-icon {
  width: 52px;
  height: 52px;
  border-radius: 11px;
  border: 1px solid var(--line);
  background: var(--panel-2);
}

.item-name {
  font-size: 10px;
  color: var(--text-dim);
  max-width: 64px;
  text-align: center;
}

.flow-arrow {
  position: absolute;
  right: -9px;
  top: 16px;
  color: var(--text-faint);
  font-size: 14px;
}

.build-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.build-row {
  padding: 11px 12px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.build-items {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.bi {
  flex: 0 0 auto;
  width: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.bi-icon {
  width: 40px;
  height: 40px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: var(--panel-2);
}

.bi-name {
  font-size: 9px;
  color: var(--text-faint);
  max-width: 46px;
  text-align: center;
}

.build-stats {
  display: flex;
  gap: 14px;
  font-size: 11px;
}

.bs {
  color: var(--text-dim);
}

.bs.dim {
  color: var(--text-faint);
}

.empty {
  color: var(--text-faint);
  font-size: 12px;
  text-align: center;
  padding: 20px 0;
}

.detail-foot {
  text-align: center;
  font-size: 11px;
  color: var(--text-faint);
  padding: 0 16px;
}

.detail-foot p {
  margin: 0;
}
</style>
