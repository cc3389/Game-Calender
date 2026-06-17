import type { GameDetailMedia } from "@/entities/game/detail-types";
import type { GameListItem } from "@/entities/game/types";

/** 防腐层入参：与具体第三方 API 参数解耦 */
export type ListReleasesQuery = {
  /** YYYY-MM */
  month: string;
  platformIds?: number[];
};

export type SearchGamesQuery = {
  /** 用户输入的检索词 */
  query: string;
  platformIds?: number[];
  /** 最多返回条数，默认 20 */
  limit?: number;
};

/**
 * 游戏发售数据源端口。新增 Twitch 等实现此接口并在 factory 中注册即可，无需改 UI / Route。
 */
export interface GameCatalogPort {
  readonly providerId: string;
  listReleasesByMonth(query: ListReleasesQuery): Promise<GameListItem[]>;
  searchGames(query: SearchGamesQuery): Promise<GameListItem[]>;
  getGameListItem(gameId: string): Promise<GameListItem | null>;
  getGameDetail(gameId: string): Promise<GameDetailMedia>;
}
