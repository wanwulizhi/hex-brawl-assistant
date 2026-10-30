const config = require('../../config.js')

Page({
  data: {
    url: '',
    ready: false,
    errorMsg: '',
  },

  onLoad() {
    this.load()
  },

  load() {
    const base = (config.H5_BASE_URL || '').trim()

    if (!base || base.includes('example.com')) {
      this.setData({
        ready: false,
        errorMsg: '尚未配置 H5 地址，请修改 miniprogram/config.js 中的 H5_BASE_URL',
      })
      return
    }

    // 拼接查询参数，便于 H5 侧识别来源
    const sep = base.includes('?') ? '&' : '?'
    const url = `${base}${sep}from=wxapp`

    this.setData({ url, ready: true, errorMsg: '' })
  },

  reload() {
    this.setData({ ready: false, errorMsg: '' })
    setTimeout(() => this.load(), 100)
  },

  onWebLoad(e) {
    console.log('[web-view] loaded', e.detail)
  },

  onWebError(e) {
    console.error('[web-view] error', e.detail)
    this.setData({
      ready: false,
      errorMsg: (e.detail && e.detail.errMsg) || '无法加载页面',
    })
  },

  // 允许页面分享
  onShareAppMessage() {
    return {
      title: '海斗大师 · 海克斯大乱斗助手',
      path: '/pages/index/index',
    }
  },

  onShareTimeline() {
    return { title: '海斗大师 · 海克斯大乱斗助手' }
  },
})
