/**
 * 数据构建脚本
 *
 * 输入（data/raw/）：
 *   - deeparam.json       真实大乱斗数据：英雄 → 海克斯强化（胜率/选取率/DeepScore）+ 核心出装
 *   - hero_list.js        腾讯官方英雄列表（中文名、英文别名、定位、属性倾向）
 *   - items.js            腾讯官方装备列表（含 ARAM 可用性、价格、属性、描述）
 *   - augment-dict.json   海克斯字典（中文名、稀有度、图标、整体胜率）
 *   - cdragon-arena.json  CommunityDragon 海克斯（英文↔中文对照，用于补图标）
 *
 * 输出（public/data/）：
 *   - meta.json / champions.json / items.json / augments.json / builds.json
 *
 * 数据来源均为公开统计站点，仅供参考。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ZH_BY_EN } from '../data/augment-zh.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RAW = path.join(ROOT, 'data', 'raw')
const OUT = path.join(ROOT, 'public', 'data')

/** 读取腾讯 CDN 的 `var x = {...}` 格式数据文件 */
function readTencentJson(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))

/** 去掉装备描述里的富文本标签 */
function stripTags(html) {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** 稀有度中英统一 */
const RARITY_ZH = {
  Prismatic: '棱彩',
  Gold: '黄金',
  Silver: '白银',
  棱彩: '棱彩',
  黄金: '黄金',
  白银: '白银',
}

/**
 * deeparam 引用的是「斗魂竞技场」版本的装备 ID（22xxxx），
 * 与 ARAM 版本（如 3111）是同一件装备的不同 ID。
 * 因此按装备中文名做映射，回退到去前缀的 ID。
 */
function resolveItemId(rawId, itemById, aramByName, allById) {
  if (itemById.has(rawId)) return rawId
  const src = allById.get(rawId)
  if (src && aramByName.has(src.name)) return aramByName.get(src.name)
  const stripped = rawId % 100000
  if (itemById.has(stripped)) return stripped
  return null
}

function main() {
  console.log('读取原始数据…')

  const heroList = readTencentJson(path.join(RAW, 'hero_list.js')).hero
  const itemList = readTencentJson(path.join(RAW, 'items.js')).items
  const deep = readJson(path.join(RAW, 'deeparam.json'))
  const augmentDict = readJson(path.join(RAW, 'augment-dict.json'))
  const cdragon = readJson(path.join(RAW, 'cdragon-arena.json'))

  // ---------- 英雄 ----------
  const champions = heroList.map((h) => ({
    id: Number(h.heroId),
    name: h.title, // 中文名，如「安妮」
    title: h.name, // 称号，如「黑暗之女」
    alias: h.alias, // 英文名，用于图标
    roles: h.roles || [],
    damage: Number(h.attack) || 0,
    defense: Number(h.defense) || 0,
    magic: Number(h.magic) || 0,
    difficulty: Number(h.difficulty) || 0,
    keywords: h.keywords || '',
  }))
  const champByAlias = new Map(champions.map((c) => [c.alias.toLowerCase(), c]))

  // ---------- 装备 ----------
  const ARAM_MAP = '嚎哭深渊'
  const items = []
  for (const it of itemList) {
    const maps = it.maps || []
    if (!maps.includes(ARAM_MAP)) continue
    const total = Number(it.total) || 0
    if (total <= 0) continue
    items.push({
      id: Number(it.itemId),
      name: it.name,
      price: Number(it.price) || 0,
      total,
      desc: stripTags(it.description).slice(0, 240),
      tags: it.types || [],
      boots: (it.types || []).includes('Boots'),
    })
  }
  const itemById = new Map(items.map((i) => [i.id, i]))
  // 全部装备（含其他模式），用于把 deeparam 的 22xxxx 映射回中文名
  const allById = new Map(itemList.map((i) => [Number(i.itemId), i]))
  // ARAM 装备名 -> 装备 ID
  const aramByName = new Map()
  for (const i of items) if (!aramByName.has(i.name)) aramByName.set(i.name, i.id)

  // ---------- 海克斯字典 ----------
  // 以 deeparam 实际出现的海克斯为准，用 dict / cdragon 补中文名与图标
  const dictByName = new Map(augmentDict.augments.map((a) => [a.name, a]))
  const cdByNameEn = new Map(cdragon.augments.filter((a) => a.nameEn).map((a) => [a.nameEn, a]))

  const augMeta = new Map() // 中文名 -> { name, nameEn, rarity, icon, globalWinRate }
  let fallbackEn = 0

  for (const champ of Object.values(deep.champions)) {
    for (const a of champ.augments) {
      const zh = ZH_BY_EN[a.name]
      const name = zh || a.name
      if (!zh) fallbackEn++
      if (augMeta.has(name)) continue

      const cd = cdByNameEn.get(a.name)
      const dict = dictByName.get(name)
      const rarity = RARITY_ZH[a.rarity] || RARITY_ZH[cd?.rarity] || '白银'
      const icon = dict?.icon || (cd?.icon ? '' : '')
      augMeta.set(name, {
        name,
        nameEn: a.name,
        rarity,
        icon,
        globalWinRate: dict?.winRate ? parseFloat(dict.winRate) : null,
      })
    }
  }

  // ---------- 组装英雄推荐 ----------
  const builds = []
  let resolvedItemRows = 0
  let droppedItemRows = 0
  let totalAugmentLinks = 0

  for (const champ of champions) {
    const d = deep.champions[champ.alias]
    if (!d) continue

    // 海克斯：按 DeepScore 排序（站点已排好，这里再兜底一次）
    const augments = d.augments
      .map((a) => {
        const zh = ZH_BY_EN[a.name] || a.name
        const meta = augMeta.get(zh) || {}
        return {
          name: zh,
          nameEn: a.name,
          slug: a.slug,
          rarity: RARITY_ZH[a.rarity] || meta.rarity || '白银',
          icon: meta.icon || '',
          winRate: a.winRate,
          pickRate: a.pickRate,
          score: a.deepScore,
        }
      })
      .sort((x, y) => (y.score ?? 0) - (x.score ?? 0))

    totalAugmentLinks += augments.length

    // 出装：把 22xxxx 映射回真实装备 ID，并过滤掉数据里没有的
    const itemBuilds = []
    for (const b of d.builds) {
      const ids = []
      for (const raw of b.rawItemIds) {
        const id = resolveItemId(raw, itemById, aramByName, allById)
        if (id) ids.push(id)
      }
      if (ids.length < 2) {
        droppedItemRows++
        continue
      }
      resolvedItemRows++
      itemBuilds.push({
        items: ids,
        winRate: b.winRate,
        pickRate: b.pickRate,
        score: b.deepScore,
      })
    }

    builds.push({
      championId: champ.id,
      augments,
      builds: itemBuilds.slice(0, 6),
      // 出场率最高的那套作为首推
      core: itemBuilds.length ? itemBuilds[0].items : [],
    })
  }

  // ---------- 输出 ----------
  fs.mkdirSync(OUT, { recursive: true })

  const augments = [...augMeta.values()].sort(
    (a, b) => (b.globalWinRate ?? 0) - (a.globalWinRate ?? 0),
  )

  const meta = {
    version: '26.21',
    generatedAt: new Date().toISOString(),
    championCount: champions.length,
    itemCount: items.length,
    augmentCount: augments.length,
    championsWithData: builds.length,
    augmentLinks: totalAugmentLinks,
    sources: [
      { name: 'DeepARAM 大乱斗统计（海克斯/出装胜率）', url: 'https://www.deeparam.com' },
      { name: '腾讯英雄联盟官方英雄与装备数据', url: 'https://game.gtimg.cn/images/lol/act/img/js/' },
      { name: 'CommunityDragon 海克斯数据', url: 'https://communitydragon.org' },
    ],
    disclaimer: '本工具为玩家自制，数据来自公开统计站点，仅供参考，与腾讯/Riot 无关。',
  }

  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2))
  fs.writeFileSync(path.join(OUT, 'champions.json'), JSON.stringify(champions))
  fs.writeFileSync(path.join(OUT, 'items.json'), JSON.stringify(items))
  fs.writeFileSync(path.join(OUT, 'augments.json'), JSON.stringify(augments))
  fs.writeFileSync(path.join(OUT, 'builds.json'), JSON.stringify(builds))

  console.log(
    `完成：${champions.length} 英雄 / ${items.length} 装备 / ${augments.length} 海克斯 / ${totalAugmentLinks} 条英雄海克斯推荐`,
  )
  console.log(`出装行：解析 ${resolvedItemRows}，丢弃 ${droppedItemRows}`)
  if (fallbackEn) console.log(`⚠ 有 ${fallbackEn} 条海克斯缺中文名，已回退英文`)
  console.log(`输出：${OUT}`)
}

main()
