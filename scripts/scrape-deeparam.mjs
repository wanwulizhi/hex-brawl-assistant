/**
 * 从 deeparam.com 抓取真实大乱斗数据（英雄 → 海克斯强化 + 出装 + 胜率）
 *
 * 该站点是 Next.js 服务端渲染，数据直接以 HTML 表格形式输出。
 * 页面结构（按 h2 分组，组内多个 h3 子表）：
 *   Augments: Augments / Augment combinations / Best upgrades
 *   Builds:   Core item builds / After the core / Starter items / Boots / Full builds / All items
 *   Playstyle: Summoner spells / Skill order
 *
 * 我们只取 Augments 组的主表（含单卡胜率）与 Builds 组的 Core item builds。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RAW = path.join(ROOT, 'data', 'raw')

const BASE = 'https://www.deeparam.com'
const CONCURRENCY = 4

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 40000)
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      if (i === retries - 1) throw e
      await sleep(1200 * (i + 1))
    }
  }
}

const text = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim()

/** 把 HTML 切成 cp-row 列表 */
function splitRows(slice) {
  const rows = []
  const re = /<div class="cp-row"[^>]*>/g
  const idxs = []
  let m
  while ((m = re.exec(slice))) idxs.push(m.index + m[0].length)
  for (let i = 0; i < idxs.length; i++) {
    const end = i + 1 < idxs.length ? idxs[i + 1] : slice.length
    rows.push(slice.slice(idxs[i], end))
  }
  return rows
}

/**
 * 取 h3 标题对应的小节 HTML。
 * 从「标题文本」出现处开始，到下一个 h2/h3 标题为止。
 */
function h3Block(html, title) {
  const re = new RegExp(`<h3[^>]*>\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</h3>`, 'i')
  const m = re.exec(html)
  if (!m) return ''
  const start = m.index + m[0].length
  const rest = html.slice(start)
  const stop = rest.search(/<h[23][\s>]/i)
  return stop < 0 ? rest : rest.slice(0, stop)
}

function parseChampionPage(html) {
  const result = { augments: [], builds: [] }

  // ---------- 海克斯强化（单卡表） ----------
  const augBlock = h3Block(html, 'Augments')
  for (const row of splitRows(augBlock)) {
    const href = row.match(/href="\/augments\/([^"]+)"/)
    const name = row.match(/<span class="cp-name">([\s\S]*?)<\/span>/)
    if (!name) continue
    const icon = row.match(/<img class="cp-icon round" src="([^"]*)"/)
    const pill = row.match(/<span class="cp-pill (\w+)">([^<]*)<\/span>/)
    const ds = row.match(/class="deepscore"[^>]*aria-label="DeepScore (\d+)"/)
    const cells = [
      ...row.matchAll(/<div class="cp-cell"><b[^>]*>([\d.]+)(?:<!-- -->)?%<\/b><small>([^<]*)<\/small><\/div>/g),
    ]
    result.augments.push({
      slug: href ? href[1] : '',
      name: text(name[1]),
      icon: icon ? icon[1] : '',
      rarity: pill ? pill[2] : '',
      deepScore: ds ? Number(ds[1]) : null,
      winRate: cells[0] ? parseFloat(cells[0][1]) : null,
      boost: cells[0] ? text(cells[0][2]) : '',
      pickRate: cells[1] ? parseFloat(cells[1][1]) : null,
    })
  }

  // ---------- 核心出装 ----------
  const buildBlock = h3Block(html, 'Core item builds')
  for (const row of splitRows(buildBlock)) {
    const ids = [...row.matchAll(/\/img\/item\/(\d+)\.png/g)].map((m) => Number(m[1]))
    if (!ids.length) continue
    const ds = row.match(/class="deepscore"[^>]*aria-label="DeepScore (\d+)"/)
    const cells = [
      ...row.matchAll(/<div class="cp-cell"><b[^>]*>([\d.]+)(?:<!-- -->)?%<\/b><small>([^<]*)<\/small><\/div>/g),
    ]
    result.builds.push({
      rawItemIds: ids,
      deepScore: ds ? Number(ds[1]) : null,
      winRate: cells[0] ? parseFloat(cells[0][1]) : null,
      pickRate: cells[1] ? parseFloat(cells[1][1]) : null,
    })
  }

  return result
}

async function main() {
  const heroFile = path.join(RAW, 'hero_list.js')
  const heroText = fs.readFileSync(heroFile, 'utf8').replace(/^\uFEFF/, '')
  const heroes = JSON.parse(heroText.slice(heroText.indexOf('{'), heroText.lastIndexOf('}') + 1)).hero

  const out = {}
  const fail = []
  let done = 0
  const queue = [...heroes]

  async function worker() {
    while (queue.length) {
      const h = queue.shift()
      const alias = h.alias
      try {
        const html = await fetchText(`${BASE}/champions/${alias}`)
        const parsed = parseChampionPage(html)
        out[alias] = parsed
        done++
        process.stdout.write(
          `[${done}/${heroes.length}] ${alias}: aug=${parsed.augments.length} build=${parsed.builds.length}\n`,
        )
      } catch (e) {
        fail.push({ alias, error: String(e.message || e) })
        process.stdout.write(`[${done}/${heroes.length}] ${alias}: FAIL ${e.message || e}\n`)
      }
      await sleep(350)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const target = path.join(RAW, 'deeparam.json')
  fs.writeFileSync(target, JSON.stringify({ scrapedAt: new Date().toISOString(), champions: out }, null, 1))
  console.log(`\n完成：${done}/${heroes.length} 成功，失败 ${fail.length}`)
  if (fail.length) console.log('失败：', JSON.stringify(fail.slice(0, 30)))
  console.log('输出：', target)
}

main()
