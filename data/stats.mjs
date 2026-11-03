/**
 * 统计口径工具：样本量估算、样本分档、Wilson 95% 置信下界、排序分
 *
 * 背景与约束（重要，改这里之前先读）：
 *
 * 1. DeepARAM 只在「英雄」层面给出场次（页面上的 ~5,190,000 Games，站点自己标注为近似值），
 *    海克斯条目和出装条目本身都不带场次。
 * 2. 因此条目级样本量只能估算：
 *       n ≈ 英雄场次 × 条目选取率
 *    这是个近似值，不是实测样本数。界面上必须标明「估算」，不能伪装成精确值。
 * 3. 排序仍以 DeepScore 为主，Wilson 下界只用来做「低样本降级」提示，
 *    不直接替换 DeepScore——避免把站点原有的评分体系改得面目全非。
 *
 * 这个文件同时被 scripts/build-data.mjs 和前端引用，保证口径一致。
 */

/**
 * 样本分档门槛
 *
 * 门槛按本项目的数据量级标定，不是照搬外部站点的绝对值。
 * 依据：1730 条「英雄×海克斯」估算场次的分位数 ——
 *   p1≈2,150 · p5≈9,270 · p25≈41,080 · 中位数≈93,000
 * 取 1 万（约 p5.4）与 5 万（约 p30）作分界：
 *   - 1 万以下：尾部，胜率容易失真 → 标「样本不足」
 *   - 1 万–5 万：可用，但需结合其他信号
 *   - 5 万以上：占七成，是本榜主体，结论相对稳
 * 若换数据源或换模式，分位数会变，门槛应重新标定。
 */
export const SAMPLE_TIERS = {
  low: { key: 'low', label: '样本不足', min: 0, max: 10000, hint: '仅供参考' },
  medium: { key: 'medium', label: '样本一般', min: 10000, max: 50000, hint: '中等' },
  high: { key: 'high', label: '样本充足', min: 50000, max: Infinity, hint: '较可信' },
}

/** 低于这个场次不给结论，只展示数字 */
export const MIN_GAMES = 10000

/**
 * 估算条目样本量
 * @param {number|null} championGames 英雄总场次
 * @param {number|null} pickRate 条目选取率（百分数，如 11.2 表示 11.2%）
 * @returns {number|null}
 */
export function estimateGames(championGames, pickRate) {
  if (!championGames || pickRate == null) return null
  if (!Number.isFinite(championGames) || !Number.isFinite(pickRate)) return null
  if (pickRate <= 0) return null
  return Math.round((championGames * pickRate) / 100)
}

/**
 * 样本分档
 * @param {number|null} games
 * @returns {{key:string,label:string,hint:string}|null}
 */
export function sampleTier(games) {
  if (games == null) return null
  if (games < SAMPLE_TIERS.low.max) return SAMPLE_TIERS.low
  if (games < SAMPLE_TIERS.medium.max) return SAMPLE_TIERS.medium
  return SAMPLE_TIERS.high
}

/**
 * Wilson 95% 置信区间下界
 * 用于把「样本少的高胜率」压下去，避免 0.3% 选取率的 100% 胜率排第一
 *
 * @param {number} wins 胜场数
 * @param {number} n 总场次
 * @param {number} z 默认 1.96（95%）
 * @returns {number|null} 百分比（0–100）
 */
export function wilsonLowerBound(wins, n, z = 1.96) {
  if (!n || n <= 0) return null
  const p = wins / n
  const z2 = z * z
  const denom = 1 + z2 / n
  const center = p + z2 / (2 * n)
  const margin = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))
  const lower = (center - margin) / denom
  return Math.max(0, Math.min(1, lower)) * 100
}

/**
 * 由胜率与估算场次算 Wilson 下界
 * @param {number|null} winRate 胜率百分数（如 52.8）
 * @param {number|null} games 估算场次
 */
export function wilsonFromRate(winRate, games) {
  if (winRate == null || !games || games <= 0) return null
  const wins = (winRate / 100) * games
  return wilsonLowerBound(wins, games)
}

/**
 * 给单条记录补充统计字段
 * @param {object} row 含 winRate / pickRate
 * @param {number|null} championGames 该英雄总场次
 */
export function attachStats(row, championGames) {
  const games = estimateGames(championGames, row.pickRate)
  const tier = sampleTier(games)
  return {
    ...row,
    games,
    gamesEstimated: games != null,
    sampleTier: tier ? tier.key : null,
    wilsonLower: wilsonFromRate(row.winRate, games),
  }
}

/** 前端展示用的场次格式化：1.2万 / 3456 */
export function formatGames(games) {
  if (games == null) return '—'
  if (games >= 10000) return `${(games / 10000).toFixed(1)}万`
  return String(games)
}
