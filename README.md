# 游戏发售日历

各平台游戏发售时间月历视图。默认通过 **RAWG** 拉取数据；服务端采用 **防腐层（GameCatalogPort）**，便于切换 Twitch/IGDB 等其它数据源，而无需改动前端与 `/api/games`。

## 技术栈

- Next.js (App Router) + React + TypeScript
- Tailwind CSS 4
- TanStack Query
- date-fns

## 快速开始

1. 在 [RAWG API](https://rawg.io/apidocs) 注册并创建 API Key。
2. 复制环境变量模板并填写 Key：

   ```bash
   cp .env.example .env.local
   ```

3. 安装依赖并启动：

   ```bash
   npm install
   npm run dev
   ```

4. 浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 环境变量

| 变量 | 说明 |
|------|------|
| `RAWG_API_KEY` | RAWG 密钥（`GAME_CATALOG_PROVIDER=rawg` 时必填） |
| `GAME_CATALOG_PROVIDER` | `rawg`（默认）或 `twitch`（占位，未实现） |
| `GAME_NAME_LOCALE` | `zh`（默认）：解析斜杠内中文，并通过 Steam 商店搜索匹配简中译名；`en` 保持 RAWG 英文名 |

## 中文名称说明

RAWG 列表接口以英文为主。默认 `GAME_NAME_LOCALE=zh` 时会：

1. 从 `English / 中文` 这类组合标题中提取中文；
2. 用 Steam 商店搜索核对 appId 后采用简中商店名（如「艾尔登法环」）。

无官方中文译名的游戏仍会显示英文。详情弹窗在名称与原文不同时会展示英文原名。

## 架构：防腐层

```
UI / fetchGamesByMonth
        ↓
  GET /api/games
        ↓
  getGameCatalogPort()  ← GAME_CATALOG_PROVIDER
        ↓
  GameCatalogPort.listReleasesByMonth()
        ↓
  RawgGameCatalogAdapter | TwitchGameCatalogAdapter …
        ↓
  GameListItem[]（领域模型）
```

- 端口定义：[`src/server/game-catalog/port.ts`](src/server/game-catalog/port.ts)
- 工厂注册：[`src/server/game-catalog/factory.ts`](src/server/game-catalog/factory.ts)
- RAWG 实现：[`src/server/game-catalog/adapters/rawg/`](src/server/game-catalog/adapters/rawg/)
- Twitch 占位：[`src/server/game-catalog/adapters/twitch/twitch-game-catalog.adapter.ts`](src/server/game-catalog/adapters/twitch/twitch-game-catalog.adapter.ts)

新增数据源步骤：

1. 在 `adapters/<provider>/` 实现 `GameCatalogPort`，将第三方响应映射为 `GameListItem`。
2. 在 `factory.ts` 的 `providers` 中注册。
3. 设置 `GAME_CATALOG_PROVIDER=<id>`。

## 脚本

- `npm run dev` — 开发服务器
- `npm run build` — 生产构建
- `npm run start` — 生产运行
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript 检查

## 说明

- API Key 仅存在于服务端 Route / Adapter，不会暴露给浏览器。
- RAWG 列表按月份缓存约 1 小时（`fetch` revalidate）。
