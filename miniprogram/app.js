const config = require('../../config.js')

App({
  globalData: {
    h5Base: config.H5_BASE_URL,
  },

  onLaunch() {
    // 记录一次启动，便于后续做版本提示
    try {
      wx.setStorageSync('lastLaunchAt', Date.now())
    } catch (e) {
      // 忽略存储异常
    }
  },

  onError(err) {
    // 生产环境可在此上报
    console.error('[app error]', err)
  },
})
