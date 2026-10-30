/**
 * 小程序配置
 *
 * H5_BASE_URL 指向线上 H5 地址。
 *
 * 当前默认值指向 GitHub Pages 演示站，可直接在「不校验合法域名」模式下预览。
 *
 * 正式发布前必须注意：
 *   1. 微信要求 web-view 的业务域名必须 HTTPS 且**已备案**；
 *   2. GitHub Pages 的 *.github.io 无法备案，正式上线请换用自有已备案域名
 *      （把 dist/ 部署到该域名下即可，无需改代码）；
 *   3. 在「开发管理 → 开发设置」下载校验文件，放到 H5 站点根目录（public/ 下）。
 */
module.exports = {
  H5_BASE_URL: 'https://wanwulizhi.github.io/hex-brawl-assistant/',
}
