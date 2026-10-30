<script setup>
import { computed, onMounted, ref } from 'vue'
import { loadBuilds, loadChampions, loadItems, loadMeta } from './composables/useData'
import ChampionList from './views/ChampionList.vue'
import ChampionDetail from './views/ChampionDetail.vue'

const loading = ref(true)
const error = ref('')
const champions = ref([])
const items = ref([])
const builds = ref([])
const meta = ref(null)

const selectedId = ref(null)

const buildMap = computed(() => {
  const m = new Map()
  for (const b of builds.value) m.set(b.championId, b)
  return m
})

const itemMap = computed(() => {
  const m = new Map()
  for (const it of items.value) m.set(it.id, it)
  return m
})

const selectedChampion = computed(() =>
  champions.value.find((c) => c.id === selectedId.value) || null,
)

const selectedBuild = computed(() =>
  selectedId.value != null ? buildMap.value.get(selectedId.value) || null : null,
)

async function boot() {
  try {
    const [metaData, champData, itemData, buildData] = await Promise.all([
      loadMeta(),
      loadChampions(),
      loadItems(),
      loadBuilds(),
    ])
    meta.value = metaData
    champions.value = champData
    items.value = itemData
    builds.value = buildData
  } catch (e) {
    error.value = String(e.message || e)
  } finally {
    loading.value = false
  }
}

function openChampion(id) {
  selectedId.value = id
  // 切换时回到顶部
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function closeChampion() {
  selectedId.value = null
}

onMounted(boot)
</script>

<template>
  <div class="app">
    <div v-if="loading" class="state-screen">
      <div class="spinner" />
      <p>正在加载海斗数据…</p>
    </div>

    <div v-else-if="error" class="state-screen">
      <p class="err-title">数据加载失败</p>
      <p class="err-msg">{{ error }}</p>
      <button class="retry" @click="boot">重试</button>
    </div>

    <ChampionDetail
      v-else-if="selectedChampion"
      :champion="selectedChampion"
      :build="selectedBuild"
      :item-map="itemMap"
      @back="closeChampion"
    />

    <ChampionList
      v-else
      :champions="champions"
      :build-map="buildMap"
      :meta="meta"
      @select="openChampion"
    />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  min-height: 100dvh;
}

.state-screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-dim);
  padding: 24px;
  text-align: center;
}

.spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.err-title {
  color: var(--text);
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}

.err-msg {
  margin: 0;
  font-size: 13px;
  color: var(--text-faint);
  word-break: break-all;
}

.retry {
  margin-top: 8px;
  padding: 10px 28px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
</style>
