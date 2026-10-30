/**
 * 数据加载与索引
 *
 * 全部数据以静态 JSON 放在 public/data 下，构建时随产物一起发布。
 * 这样 H5 与小程序 web-view 都只需要静态托管，无需后端。
 */

const cache = new Map()

async function loadJson(name) {
  if (cache.has(name)) return cache.get(name)
  const promise = fetch(`${import.meta.env.BASE_URL}data/${name}`).then((r) => {
    if (!r.ok) throw new Error(`加载 ${name} 失败: ${r.status}`)
    return r.json()
  })
  cache.set(name, promise)
  return promise
}

export const loadMeta = () => loadJson('meta.json')
export const loadChampions = () => loadJson('champions.json')
export const loadItems = () => loadJson('items.json')
export const loadAugments = () => loadJson('augments.json')
export const loadBuilds = () => loadJson('builds.json')

/** 装备/英雄/海克斯图标地址（腾讯官方 CDN，国内可直连） */
export const itemIcon = (id) => `https://game.gtimg.cn/images/lol/act/img/item/${id}.png`
export const championIcon = (alias) =>
  `https://game.gtimg.cn/images/lol/act/img/champion/${alias}.png`
export const championSplash = (id) =>
  `https://game.gtimg.cn/images/lol/act/img/champion/${id}_0.jpg`

/** 角色定位中文名 */
export const ROLE_LABEL = {
  mage: '法师',
  assassin: '刺客',
  fighter: '战士',
  tank: '坦克',
  marksman: '射手',
  support: '辅助',
}

/** 稀有度配色 */
export const RARITY_META = {
  棱彩: { label: '棱彩', color: '#c86bff' },
  黄金: { label: '黄金', color: '#f0b429' },
  白银: { label: '白银', color: '#9aa8bd' },
}

/**
 * 英雄强度分组（按大乱斗胜率，从「夯」到「拉」）
 *
 * 与 scripts/build-data.mjs 共用同一份口径（data/win-groups.mjs）。
 * 前端再算一次，兼容分组字段缺失的旧数据。
 */
export const WIN_GROUPS = [
  { key: 'hang', label: '夯', sub: '版本之子', min: 54, color: '#ff7a45' },
  { key: 'meng', label: '猛', sub: '强势上分', min: 52, color: '#f0b429' },
  { key: 'zhong', label: '中', sub: '中规中矩', min: 50, color: '#34d399' },
  { key: 'pianla', label: '偏拉', sub: '略微吃力', min: 48, color: '#8ecfff' },
  { key: 'la', label: '拉', sub: '谨慎选择', min: -Infinity, color: '#9aa8bd' },
]

const GROUP_BY_KEY = new Map(WIN_GROUPS.map((g) => [g.key, g]))

export function groupOf(winRate) {
  if (winRate == null) return WIN_GROUPS[WIN_GROUPS.length - 1]
  return WIN_GROUPS.find((g) => winRate >= g.min) || WIN_GROUPS[WIN_GROUPS.length - 1]
}

export function groupMeta(key, winRate) {
  return GROUP_BY_KEY.get(key) || groupOf(winRate)
}
