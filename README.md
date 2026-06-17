# 游戏发售日历（Game Calender）

跨平台游戏发售 **宣发专题页**：宽屏沉浸式背景 + **Hero 媒体轮播**（标题角标、截图/预告）、**发售日历** 与 **当日封面条带** 联动，详情卡片在日历下方；支持平台筛选与本地关注。无传统弹窗详情页。

数据默认来自 [RAWG API](https://rawg.io/apidocs)，中文名与部分媒体内容通过 Steam 商店 API 增强。服务端采用**防腐层**，便于日后替换为 Twitch/IGDB 等数据源，而无需改动前端。

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 宣发展示 | Hero 媒体轮播（约 2:1、限高）；左上角标题；预告/截图不挡控件 |
| 发售日历 | 筛选栏紧贴日历上方一行；选日驱动封面条带 |
| 封面条带 | 当日游戏横向胶片；点击切换 Hero |
| 心愿单 | 筛选栏「关注」面板；Hero 下方详情卡「加入关注」；「仅关注」筛选 |
| URL 深链 | `?month=YYYY-MM&platforms=…&game=RAWG_ID` |
| 月份导航 | 顶栏胶囊：上/下月、年月选择、今天 |
| 平台筛选 | PC、PS5、Xbox Series、Switch 等（RAWG 平台 ID） |
| 媒体 | RAWG 截图 + Steam 预告（hls.js）；Hero 内全屏看图 |
| 中文名称 | 可选 `GAME_NAME_LOCALE=zh`：Steam 简中店名匹配 |

---

## 技术栈

- **框架**：Next.js 16（App Router）、React 19、TypeScript
- **样式**：Tailwind CSS 4
- **数据**：TanStack Query、date-fns、Zod
- **UI**：Radix Dialog / Popover、hls.js
- **数据源**：RAWG（列表与详情子资源）、Steam（简中文案、预告 HLS、截图补全）

---

## 项目结构

```
src/
├── app/                    # 路由与 API
│   ├── page.tsx            # 首页（日历）
│   └── api/games/          # GET 按月列表、GET /:id 详情媒体
├── entities/game/          # 领域类型（GameListItem、详情 DTO）
├── features/               # 按功能划分 UI
│   ├── calendar/           # 月历逻辑、年月选择（工具组件）
│   ├── showcase/           # 宣发页 Shell、Hero、日历皮肤、封面条带
│   ├── game-detail/        # HLS 播放器、媒体轮播（供 Hero 复用）
│   ├── platform-filter/    # 平台筛选
│   ├── search/             # 游戏名称搜索
│   └── wishlist/           # 本地关注列表
├── server/game-catalog/    # 防腐层与 RAWG/Twitch 适配器
└── shared/                 # API 客户端、平台配置、通用组件
```

---

## 架构与数据流

### 发售列表

```
浏览器  →  GET /api/games?month=YYYY-MM&platforms=…
         →  getGameCatalogPort()
         →  RawgGameCatalogAdapter.listReleasesByMonth()
         →  GameListItem[]（统一领域模型）
```

### 游戏详情（懒加载）

```
详情弹窗打开  →  GET /api/games/:id
              →  GameCatalogPort.getGameDetail()
              →  RAWG 详情 / 截图 / 视频 + Steam 简中介绍与媒体补全
```

### 防腐层

- 端口：[`src/server/game-catalog/port.ts`](src/server/game-catalog/port.ts)（`listReleasesByMonth`、`getGameDetail`）
- 工厂：[`src/server/game-catalog/factory.ts`](src/server/game-catalog/factory.ts)（`GAME_CATALOG_PROVIDER`）
- RAWG：[`src/server/game-catalog/adapters/rawg/`](src/server/game-catalog/adapters/rawg/)
- Twitch 占位：[`src/server/game-catalog/adapters/twitch/`](src/server/game-catalog/adapters/twitch/)

扩展新数据源：实现 `GameCatalogPort` → 在 `factory.ts` 注册 → 设置环境变量即可。

---

## 快速开始

1. 在 [RAWG](https://rawg.io/apidocs) 注册并创建 API Key。
2. 复制环境变量并填写 Key：

   ```bash
   cp .env.example .env.local
   ```

3. 安装依赖并启动：

   ```bash
   npm install
   npm run dev
   ```

4. 打开 [http://localhost:3000](http://localhost:3000)。

### 局域网开发

`npm run dev` 已绑定 `0.0.0.0`。Next.js 16 对 HMR 有跨域限制，本项目在 [`next.config.ts`](next.config.ts) 中放行常见内网段；仍失败时可设置 `DEV_ALLOWED_ORIGINS=你的IP` 并重启 dev。详见下方环境变量表。

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `RAWG_API_KEY` | RAWG 密钥（`GAME_CATALOG_PROVIDER=rawg` 时必填） |
| `GAME_CATALOG_PROVIDER` | `rawg`（默认）或 `twitch`（占位，未实现） |
| `GAME_NAME_LOCALE` | `zh`（默认）：尝试中文展示名；`en` 保持 RAWG 英文 |
| `DEV_ALLOWED_ORIGINS` | 开发模式额外允许的 HMR 来源主机名，逗号分隔 |

---

## 数据与限制说明

- **RAWG**：按月 `dates` 查询；列表响应经 Zod 校验；服务端 `fetch` 缓存约 1 小时。
- **中文名**：RAWG 以英文为主；Steam 搜索用于译名，无匹配时仍为英文。
- **EA 标识**：依据 RAWG `early-access` 等标签识别，日历上显示 **EA**，详情中显示「抢先体验 / 正式版」。
- **视频**：许多条目 RAWG 无 `/movies`；有 Steam 匹配时会拉取 HLS 预告。无 Steam 或无媒体时仅展示封面/截图。
- **密钥安全**：`RAWG_API_KEY` 仅存在于服务端 Route/Adapter，不暴露给浏览器。

---

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器（`0.0.0.0:3000`） |
| `npm run build` | 生产构建 |
| `npm run start` | 生产运行 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 检查（`tsc --noEmit`） |

---

## 许可证与致谢

- 游戏数据：[RAWG.io](https://rawg.io/)
- 部分中文与媒体：[Steam](https://store.steampowered.com/) 公开商店接口  
使用本项目时请遵守各 API 服务条款与署名要求。
