<script setup>
import { computed } from 'vue'

const props = defineProps({
  meta: { type: Object, default: null },
})

const emit = defineEmits(['back'])

const m = computed(() => props.meta || {})
const method = computed(() => m.value.methodology || {})
const stats = computed(() => m.value.stats || {})

/** 分档表格：把口径写死在这里，避免和 build 脚本口径漂移 */
const tierRows = computed(() => {
  const tiers = method.value.sampleTiers || []
  const byTier = stats.value.augmentLinksByTier || {}
  return tiers.map((t) => ({
    ...t,
    count: byTier[t.key] ?? 0,
    range:
      t.max == null
        ? `≥ ${t.min ?? 0} 场`
        : t.min == null
          ? `< ${t.max} 场`
          : `${t.min} – ${t.max - 1} 场`,
  }))
})

const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('zh-CN'))
</script>

<template>
  <div class="method-page">
    <header class="topbar">
      <button class="back" @click="emit('back')" aria-label="返回">
        <span class="chev">‹</span>
      </button>
      <div class="topbar-title">
        <span class="name">数据说明</span>
        <span class="sub">口径与使用边界</span>
      </div>
    </header>

    <!-- 版本信息 -->
    <section class="block">
      <h2>当前版本</h2>
      <dl class="kv">
        <div class="kv-row">
          <dt>版本</dt>
          <dd>{{ m.version ?? '—' }}</dd>
        </div>
        <div class="kv-row">
          <dt>数据生成</dt>
          <dd>{{ m.generatedAt ? new Date(m.generatedAt).toLocaleString('zh-CN') : '—' }}</dd>
        </div>
        <div class="kv-row">
          <dt>英雄 / 海克斯</dt>
          <dd>{{ m.championCount ?? '—' }} / {{ m.augmentCount ?? '—' }}</dd>
        </div>
        <div class="kv-row">
          <dt>英雄×海克斯条目</dt>
          <dd>{{ fmt(m.augmentLinks) }}</dd>
        </div>
      </dl>
    </section>

    <!-- 样本量怎么来的：最需要讲清楚的一段 -->
    <section class="block">
      <h2>样本量是怎么来的</h2>
      <p class="para">
        数据源只在<strong>英雄</strong>层面给出场次，海克斯条目和出装条目本身不带场次。
        因此本站展示的条目场次是<strong>估算值</strong>：
      </p>
      <p class="formula">条目场次 ≈ 英雄总场次 × 该条目选取率</p>
      <p class="para">
        界面上所有场次都带 <code>≈</code> 前缀，含义就是「估算」。它用来判断一条结论有没有底气，
        不等于精确的实测对局数。
      </p>
    </section>

    <!-- 分档 -->
    <section class="block">
      <h2>样本分档</h2>
      <p class="para">
        低于 {{ method.minGames ?? 250 }} 场的条目，本站会显式标注「样本不足」。
        样本越少，胜率越容易被随机波动放大，排序时不应直接采信。
      </p>
      <ul class="tier-list">
        <li v-for="t in tierRows" :key="t.key" class="tier-row">
          <span class="tier-name">{{ t.label }}</span>
          <span class="tier-range">{{ t.range }}</span>
          <span class="tier-count">{{ fmt(t.count) }} 条</span>
          <span class="tier-hint">{{ t.hint }}</span>
        </li>
      </ul>
      <p v-if="!tierRows.length" class="para dim">分档统计将在下次数据构建后生成。</p>
    </section>

    <!-- 排序 -->
    <section class="block">
      <h2>排序与评分</h2>
      <p class="para">
        榜单以数据源给出的 <strong>DeepScore</strong> 为主排序依据。本站另外计算
        Wilson 95% 置信下界（<code>{{ method.confidenceInterval || 'wilson_95' }}</code>），
        用于标记低样本条目，<strong>不替换</strong>原有评分体系，避免口径被改动得面目全非。
      </p>
      <p class="para">
        DeepScore 综合了胜率与样本量：选取率极低的条目需要更大的优势才能排到前面。
        因此 DS 高不等于胜率高，两者要一起看。
      </p>
    </section>

    <!-- 使用边界：这段是重点 -->
    <section class="block">
      <h2>使用边界</h2>
      <ul class="caveats">
        <li v-for="(c, i) in method.caveats || []" :key="i">{{ c }}</li>
      </ul>
      <p v-if="!method.caveats" class="para dim">暂无边界说明。</p>
    </section>

    <!-- 数据来源 -->
    <section class="block">
      <h2>数据来源</h2>
      <ul class="sources">
        <li v-for="s in m.sources || []" :key="s.name">
          <a :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.name }}</a>
        </li>
      </ul>
      <p class="para dim">{{ m.disclaimer }}</p>
    </section>

    <footer class="foot">
      <p>本工具为玩家自制，与腾讯、Riot Games 无任何关联。</p>
    </footer>
  </div>
</template>

<style scoped>
.method-page {
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

.block {
  padding: 18px 16px 0;
}

.block h2 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
}

.para {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-dim);
}

.para strong {
  color: var(--text);
  font-weight: 600;
}

.para.dim {
  color: var(--text-faint);
  font-size: 12px;
}

.para code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--panel-2);
  font-size: 12px;
  color: var(--accent);
}

.formula {
  margin: 10px 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-left: 3px solid var(--accent);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
}

.kv {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.kv-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  background: var(--panel);
}

.kv-row dt {
  font-size: 12px;
  color: var(--text-faint);
}

.kv-row dd {
  margin: 0;
  font-size: 12px;
  color: var(--text);
  font-weight: 600;
  text-align: right;
}

.tier-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tier-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 12px;
}

.tier-name {
  flex: 0 0 auto;
  font-weight: 600;
  color: var(--text);
}

.tier-range {
  flex: 0 0 auto;
  color: var(--text-faint);
}

.tier-count {
  flex: 1 1 auto;
  text-align: right;
  color: var(--text-dim);
}

.tier-hint {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--text-faint);
}

.caveats {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.caveats li {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-dim);
}

.sources {
  margin: 0 0 10px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sources a {
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
  word-break: break-all;
}

.sources a:hover {
  text-decoration: underline;
}

.foot {
  padding: 22px 16px 0;
  text-align: center;
  font-size: 11px;
  color: var(--text-faint);
}
</style>
