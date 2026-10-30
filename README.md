# 海斗大师 · Hex Brawl Assistant

> 英雄联盟「海克斯大乱斗」（ARAM: Mayhem）助手：查询任意英雄的**高胜率海克斯强化**与**高胜率出装**。
> 以 H5 形式发布，可同时作为网页使用，也能被**微信小程序**以 `web-view` 内嵌。

<p align="center">
  <b>173 位英雄</b> · <b>1730 条英雄×海克斯胜率</b> · <b>1038 套出装</b> · 纯静态、无后端
</p>

---

## 功能

- **英雄列表**：173 位英雄，支持按中文名 / 称号 / 拼音搜索，按定位（法师、刺客、战士、坦克、射手、辅助）筛选。
- **海克斯强化推荐**：每位英雄按 DeepScore 排序展示海克斯，含**胜率**、**选取率**、**稀有度**（棱彩 / 黄金 / 白银）。
- **高胜率出装**：展示核心装备路线与多套出装方案，每套都带胜率与选取率。
- **移动端优先**：375–430px 宽度下优化，支持 iPhone 安全区（`env(safe-area-inset-*)`）。
- **双端发布**：同一份 H5 产物既能部署到 GitHub Pages，也能被微信小程序 `web-view` 直接引用。

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（默认 http://localhost:5173）
npm run dev

# 生产构建，产物在 dist/
npm run build

# 本地预览构建产物
npm run preview
```

## 项目结构

```
.
├── index.html                  # H5 入口
├── vite.config.js              # Vite 配置（base: './'，便于子目录部署）
├── public/data/                # 构建产物：静态数据（随 dist 一起发布）
│   ├── meta.json               # 版本与数据统计
│   ├── champions.json          # 英雄索引
│   ├── items.json              # 装备字典
│   ├── augments.json           # 海克斯字典
│   └── builds.json             # 英雄 → 海克斯 + 出装
├── src/
│   ├── App.vue                 # 根组件与路由（列表 / 详情）
│   ├── views/
│   │   ├── ChampionList.vue    # 英雄列表页
│   │   └── ChampionDetail.vue  # 英雄详情页（海克斯 + 出装）
│   ├── composables/useData.js  # 数据加载、图标地址、常量
│   └── styles/main.css         # 全局样式与设计变量
├── scripts/
│   ├── scrape-deeparam.mjs     # 抓取大乱斗统计数据
│   └── build-data.mjs          # 合并数据、生成 public/data
├── data/
│   ├── augment-zh.mjs          # 海克斯英文名 → 中文名对照表
│   └── raw/                    # 原始数据快照
├── miniprogram/                # 微信小程序壳（web-view 内嵌 H5）
└── .github/workflows/deploy.yml # 自动部署到 GitHub Pages
```

## 数据来源与更新

| 数据 | 来源 | 说明 |
| --- | --- | --- |
| 海克斯 / 出装胜率 | [DeepARAM](https://www.deeparam.com) | 大乱斗（ARAM: Mayhem）实测统计，含胜率、选取率、DeepScore |
| 英雄 / 装备基础数据 | [腾讯英雄联盟官方 CDN](https://game.gtimg.cn/images/lol/act/img/js/) | 中文名、定位、装备属性与描述、图标 |
| 海克斯中英对照 | [CommunityDragon](https://communitydragon.org) + 人工校对 | `data/augment-zh.mjs` |

### 更新数据

```bash
# 1) 重新抓取统计（约 5–8 分钟，173 位英雄）
npm run data:scrape

# 2) 合并生成前端数据
npm run data:build
```

> 抓取脚本对目标站点做了限速（并发 4、每次间隔 350ms），请勿调高并发。
> 若站点改版导致解析失败，`scripts/scrape-deeparam.mjs` 里按 `h3` 小节定位表格的逻辑需要同步调整。

### 新增海克斯的中文名

游戏版本更新会加入新海克斯。若抓取结果里出现未翻译的英文名，在 `data/augment-zh.mjs` 的 `ZH_BY_EN` 中补一行：

```js
export const ZH_BY_EN = {
  // ...
  'New Augment Name': '新海克斯中文名',
}
```

未收录的名称会回退显示英文，不会报错。

## 微信小程序

`miniprogram/` 是一个薄壳，用 `web-view` 加载线上 H5。

### 接入步骤

1. **部署 H5**：推送到 GitHub 后，`deploy.yml` 会自动发布到 GitHub Pages，得到类似
   `https://<用户名>.github.io/hex-brawl-assistant/` 的地址。
2. **配置域名**：修改 `miniprogram/config.js`：

   ```js
   module.exports = {
     H5_BASE_URL: 'https://<用户名>.github.io/hex-brawl-assistant/',
   }
   ```

3. **小程序后台配置**（微信公众平台 → 开发管理 → 开发设置）：
   - 把该域名加入 **业务域名**；
   - 下载校验文件，放到 H5 站点根目录（即 `public/` 下，随构建发布）。
4. **用微信开发者工具**打开 `miniprogram/` 目录即可预览。本地调试可勾选「不校验合法域名」。

### 注意事项

- `web-view` 要求域名 **HTTPS + 已备案**（国内主体）。GitHub Pages 的 `*.github.io` 无法完成备案，正式上线需换用自有已备案域名（可用 CDN / 对象存储托管 `dist/`）。
- 小程序内无法使用 `window.open` 等浏览器 API；本项目未使用，兼容无碍。
- 未配置 `H5_BASE_URL` 时，小程序会显示配置提示页而不是白屏。

## 技术说明

- **Vue 3 + Vite**，无 UI 框架依赖，产物 gzip 后约 30 KB JS + 3 KB CSS。
- 数据全部静态 JSON，**无后端、无数据库**，可直接托管在任意静态服务。
- `base: './'` 使用相对路径，因此部署到 GitHub Pages 子路径或任意子目录都能正常工作。
- 构建目标 `es2018`，兼容微信内置浏览器与较旧 Android WebView。
- 图标走腾讯官方 CDN（国内可直连），避免额外图床。

## 免责声明

本项目为玩家自制工具，**与腾讯、Riot Games 无任何关联**。
所有统计数据来自公开统计站点，仅供参考；英雄、装备、海克斯名称与图标版权归原权利人所有。

## License

[MIT](./LICENSE)
