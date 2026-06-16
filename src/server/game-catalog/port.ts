import type { GameListItem } from "@/entities/game/types";

/** 防腐层入参：与具体第三方 API 参数解耦 */
export type ListReleasesQuery = {
  /** YYYY-MM */
  month: string;
  platformIds?: number[];
};

/**
 * 游戏发售数据源端口。新增 Twitch 等实现此接口并在 factory 中注册即可，无需改 UI / Route。
 */
export interface GameCatalogPort {
  readonly providerId: string;
  listReleasesByMonth(query: ListReleasesQuery): Promise<GameListItem[]>;
}
