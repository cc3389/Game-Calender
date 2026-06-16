import type { GameDetailMedia } from "@/entities/game/detail-types";
import type { GameListItem } from "@/entities/game/types";
import type { GameCatalogPort, ListReleasesQuery } from "../../port";

/**
 * Twitch / IGDB 等数据源的占位实现。
 * 接入时在此调用 OAuth + IGDB API，并映射为 GameListItem[]。
 */
export class TwitchGameCatalogAdapter implements GameCatalogPort {
  readonly providerId = "twitch";

  async listReleasesByMonth(query: ListReleasesQuery): Promise<GameListItem[]> {
    void query;
    throw new Error(
      "Twitch/IGDB catalog adapter is not implemented yet. Set GAME_CATALOG_PROVIDER=rawg or implement this adapter.",
    );
  }

  async getGameDetail(gameId: string): Promise<GameDetailMedia> {
    void gameId;
    throw new Error(
      "Twitch/IGDB game detail is not implemented yet. Set GAME_CATALOG_PROVIDER=rawg.",
    );
  }
}
