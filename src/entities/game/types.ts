/** 领域模型：UI 与 API 对外只依赖此形状，与 RAWG/Twitch 等无关 */

export type GameStoreLink = {
  name: string;
  url: string;
};

export type GameListItem = {
  id: string;
  /** 界面展示用名称（可为本中文译名） */
  name: string;
  /** 数据源原始英文名，与 name 不同时可在详情中展示 */
  nameOriginal?: string;
  released: string;
  coverUrl: string | null;
  platformNames: string[];
  storeLinks: GameStoreLink[];
  sourceProvider: string;
};

export type GamesByDate = Map<string, GameListItem[]>;

export function groupGamesByReleased(games: GameListItem[]): GamesByDate {
  const map: GamesByDate = new Map();
  for (const game of games) {
    const list = map.get(game.released) ?? [];
    list.push(game);
    map.set(game.released, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  }
  return map;
}
