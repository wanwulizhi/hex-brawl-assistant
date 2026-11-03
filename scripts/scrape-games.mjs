/**
 * 只抓英雄场次（games），不动其他数据
 *
 * 背景：完整抓取要拉 173 个页面的全部表格，耗时且容易卡住。
 * 这里只取每个英雄页头部 cp-strip 的 Games 字段，写入
 * data/raw/champion-games.json，由 build-data 合并进 performance。
 *
 * 断点续跑：已抓到的英雄会跳过，中断后重跑即可。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RAW = path.join(ROOT, 'data', 'raw')
const OUT_FILE = path.join(RAW, 'champion-games.json')

const BASE = 'https://deeparam.com'
// 串行 + 间隔，避免被站点限流；173 个约 6–8 分钟
const CONCURRENCY = 1
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 25000)
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
      await sleep(1000 * (i + 1))
    }
  }
}

/** 从页面头部 cp-strip 取场次：<b>~5,190,000</b><small>Games</small> */
function parseGames(html) {
  const m = html.match(/<b>\s*~?\s*([\d,]+)\s*<\/b>\s*<small>\s*Games\s*<\/small>/i)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

async function main() {
  const heroFile = path.join(RAW, 'hero_list.js')
  const heroText = fs.readFileSync(heroFile, 'utf8').replace(/^\uFEFF/, '')
  const heroes = JSON.parse(
    heroText.slice(heroText.indexOf('{'), heroText.lastIndexOf('}') + 1),
  ).hero

  // 断点续跑：读取已有结果
  let done = {}
  if (fs.existsSync(OUT_FILE)) {
    try {
      done = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'))
    } catch {
      done = {}
    }
  }
  const doneCount = Object.keys(done).length
  if (doneCount) console.log(`续跑：已有 ${doneCount} 条`)

  const queue = heroes.filter((h) => !done[h.alias])
  console.log(`待抓 ${queue.length} 个英雄`)

  let finished = 0
  const total = queue.length

  function save() {
    fs.writeFileSync(OUT_FILE, JSON.stringify(done, null, 1))
  }

  async function worker() {
    while (queue.length) {
      const h = queue.shift()
      try {
        const html = await fetchText(`${BASE}/champions/${h.alias}`)
        const games = parseGames(html)
        if (games) done[h.alias] = games
        finished++
        process.stdout.write(`[${finished}/${total}] ${h.alias} = ${games ?? 'null'}\n`)
      } catch (e) {
        finished++
        process.stdout.write(`[${finished}/${total}] ${h.alias} FAIL ${e.message || e}\n`)
      }
      // 每 5 个落一次盘，中断也不丢太多
      if (finished % 5 === 0) save()
      await sleep(300)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  save()

  console.log(`\n完成：${Object.keys(done).length}/${heroes.length} 个英雄有场次`)
  console.log(`输出：${OUT_FILE}`)
}

main()
