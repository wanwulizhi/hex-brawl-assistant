/**
 * 小程序配置
 *
 * H5_BASE_URL 必须改成你的线上 H5 地址。
 * 微信要求：
 *   1. 该域名已在小程序后台「开发管理 → 服务器域名」里配置为业务域名；
 *   2. 域名必须是 HTTPS，且已备案；
 *   3. 需要在「开发管理 → 开发设置」下载校验文件放到站点根目录。
 *
 * 本地调试时，在微信开发者工具里勾选「不校验合法域名」即可用 http 地址。
 */
module.exports = {
  // 例：'https://your-name.github.io/hex-brawl-assistant/'
  H5_BASE_URL: 'https://example.com/hex-brawl-assistant/',
}
