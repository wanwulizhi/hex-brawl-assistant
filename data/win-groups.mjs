/**
 * 英雄强度分组（按大乱斗胜率，从「夯」到「拉」）
 *
 * 由 scripts/build-data.mjs 与前端共用，保证分组口径一致。
 * 阈值按当前版本（26.21）胜率分布设定，版本更新后可在此微调。
 */

export const WIN_GROUPS = [
  {
    key: 'hang',
    label: '夯',
    sub: '版本之子',
    min: 54,
    color: '#ff7a45',
    gradient: 'linear-gradient(135deg, #ff7a45, #ff9f6b)',
  },
  {
    key: 'meng',
    label: '猛',
    sub: '强势上分',
    min: 52,
    color: '#f0b429',
    gradient: 'linear-gradient(135deg, #f0b429, #ffd873)',
  },
  {
    key: 'zhong',
    label: '中',
    sub: '中规中矩',
    min: 50,
    color: '#34d399',
    gradient: 'linear-gradient(135deg, #34d399, #6ee7b7)',
  },
  {
    key: 'pianla',
    label: '偏拉',
    sub: '略微吃力',
    min: 48,
    color: '#8ecfff',
    gradient: 'linear-gradient(135deg, #5aa9e6, #8ecfff)',
  },
  {
    key: 'la',
    label: '拉',
    sub: '谨慎选择',
    min: -Infinity,
    color: '#9aa8bd',
    gradient: 'linear-gradient(135deg, #6b7a93, #9aa8bd)',
  },
]

/** 按胜率返回所属分组 */
export function groupOf(winRate) {
  if (winRate == null) return WIN_GROUPS[WIN_GROUPS.length - 1]
  return WIN_GROUPS.find((g) => winRate >= g.min) || WIN_GROUPS[WIN_GROUPS.length - 1]
}
