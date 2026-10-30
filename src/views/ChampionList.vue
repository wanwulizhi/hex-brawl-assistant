<script setup>
import { computed, ref } from 'vue'
import { championIcon, ROLE_LABEL } from '../composables/useData'

const props = defineProps({
  champions: { type: Array, required: true },
  buildMap: { type: Map, required: true },
  meta: { type: Object, default: null },
})

const emit = defineEmits(['select'])

const keyword = ref('')
const activeRole = ref('all')

const ROLES = [
  { key: 'all', label: '全部' },
  { key: 'mage', label: '法师' },
  { key: 'assassin', label: '刺客' },
  { key: 'fighter', label: '战士' },
  { key: 'tank', label: '坦克' },
  { key: 'marksman', label: '射手' },
  { key: 'support', label: '辅助' },
]

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return props.champions.filter((c) => {
    if (activeRole.value !== 'all' && !c.roles.includes(activeRole.value)) return false
    if (!kw) return true
    return (
      c.name.toLowerCase().includes(kw) ||
      c.title.toLowerCase().includes(kw) ||
      c.alias.toLowerCase().includes(kw) ||
      c.keywords.toLowerCase().includes(kw)
    )
  })
})

/** 每个英雄的首推海克斯（用于列表页展示强度标记） */
function topAugment(championId) {
  const b = props.buildMap.get(championId)
  return b && b.augments.length ? b.augments[0] : null
}

function roleText(roles) {
  return roles.map((r) => ROLE_LABEL[r]).filter(Boolean).join(' / ')
}
</script>

<template>
  <div class="list-page">
    <header class="hero-head">
      <div class="brand">
        <span class="logo">海</span>
        <div class="brand-text">
          <h1>海斗大师</h1>
          <p>海克斯大乱斗 · 出装与强化助手</p>
        </div>
      </div>
      <p v-if="meta" class="meta-line">
        版本 {{ meta.version }} · {{ meta.championCount }} 位英雄 · {{ meta.augmentCount }} 个海克斯
      </p>
    </header>

    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="keyword" type="search" placeholder="搜索英雄名 / 称号 / 拼音" enterkeyhint="search" />
      <button v-if="keyword" class="clear" @click="keyword = ''">✕</button>
    </div>

    <div class="role-tabs">
      <button
        v-for="r in ROLES"
        :key="r.key"
        class="role-tab"
        :class="{ active: activeRole === r.key }"
        @click="activeRole = r.key"
      >
        {{ r.label }}
      </button>
    </div>

    <p class="result-count">
      共 <b>{{ filtered.length }}</b> 位英雄
    </p>

    <div class="champ-grid">
      <button
        v-for="c in filtered"
        :key="c.id"
        class="champ-card"
        @click="emit('select', c.id)"
      >
        <div class="avatar-wrap">
          <img :src="championIcon(c.alias)" :alt="c.name" loading="lazy" class="avatar" />
          <span v-if="topAugment(c.id)" class="hot-dot" />
        </div>
        <div class="champ-info">
          <p class="champ-name ellipsis">{{ c.name }}</p>
          <p class="champ-role ellipsis">{{ roleText(c.roles) }}</p>
        </div>
      </button>
    </div>

    <p v-if="!filtered.length" class="empty">没有找到匹配的英雄</p>

    <footer class="foot">
      <p v-if="meta">数据更新于 {{ new Date(meta.generatedAt).toLocaleDateString('zh-CN') }}</p>
      <p class="disclaimer">数据来自公开统计站点，仅供参考</p>
    </footer>
  </div>
</template>

<style scoped>
.list-page {
  padding: calc(16px + var(--safe-top)) 16px calc(24px + var(--safe-bottom));
  max-width: 900px;
  margin: 0 auto;
}

.hero-head {
  padding: 8px 0 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 6px 18px rgba(61, 139, 253, 0.35);
}

.brand-text h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand-text p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-dim);
}

.meta-line {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--text-faint);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.search-icon {
  font-size: 14px;
  opacity: 0.6;
}

.search-bar input {
  flex: 1;
  min-width: 0;
}

.search-bar input::placeholder {
  color: var(--text-faint);
}

.clear {
  font-size: 13px;
  color: var(--text-faint);
  padding: 2px 4px;
}

.role-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

.role-tab {
  flex: 0 0 auto;
  padding: 7px 15px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-dim);
  background: var(--panel);
  border: 1px solid var(--line);
  transition: all 0.15s;
}

.role-tab.active {
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-color: transparent;
  font-weight: 600;
}

.result-count {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--text-faint);
}

.result-count b {
  color: var(--text-dim);
}

.champ-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
}

.champ-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
  transition: transform 0.12s, border-color 0.15s;
}

.champ-card:active {
  transform: scale(0.96);
  border-color: rgba(61, 139, 253, 0.6);
}

.avatar-wrap {
  position: relative;
  aspect-ratio: 1;
  background: var(--panel-2);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--good);
  box-shadow: 0 0 0 2px rgba(11, 16, 32, 0.7);
}

.champ-info {
  padding: 7px 9px 8px;
}

.champ-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.champ-role {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--text-faint);
}

.empty {
  text-align: center;
  color: var(--text-faint);
  font-size: 13px;
  padding: 40px 0;
}

.foot {
  margin-top: 28px;
  text-align: center;
  font-size: 11px;
  color: var(--text-faint);
  line-height: 1.7;
}

.foot p {
  margin: 0;
}

.disclaimer {
  opacity: 0.75;
}
</style>
