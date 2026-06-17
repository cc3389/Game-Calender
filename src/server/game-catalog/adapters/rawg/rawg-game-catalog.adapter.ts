import type { GameListItem } from "@/entities/game/types";
import { GameCatalogConfigError } from "../../errors";
import type { GameCatalogPort, ListReleasesQuery, SearchGamesQuery } from "../../port";
import { buildRawgGameDetail } from "./build-rawg-game-detail";
import { shouldLocalizeNamesToZh } from "./display-name-locale";
import {
  fetchRawgGameById,
  fetchRawgGamesForMonth,
  fetchRawgGamesSearch,
} from "./rawg-api.client";
import { mapRawgGameToListItem } from "./map-rawg-game";
import { applyChineseDisplayNames } from "./resolve-zh-display-name";

function requireRawgKey(): string {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new GameCatalogConfigError(
      "RAWG_API_KEY is not configured. Add it to .env.local or switch GAME_CATALOG_PROVIDER.",
    );
  }
  return apiKey;
}

export class RawgGameCatalogAdapter implements GameCatalogPort {
  readonly providerId = "rawg";

  async listReleasesByMonth(query: ListReleasesQuery): Promise<GameListItem[]> {
    const apiKey = requireRawgKey();

    const rawGames = await fetchRawgGamesForMonth(
      query.month,
      query.platformIds,
      apiKey,
    );

    let games = rawGames
      .map(mapRawgGameToListItem)
      .filter((g): g is GameListItem => g !== null);

    if (shouldLocalizeNamesToZh()) {
      games = await applyChineseDisplayNames(games);
    }

    return games;
  }

  async searchGames(query: SearchGamesQuery) {
    const apiKey = requireRawgKey();
    const limit = query.limit ?? 20;
    const rawGames = await fetchRawgGamesSearch(
      query.query,
      query.platformIds,
      apiKey,
      limit,
    );

    let games = rawGames
      .map(mapRawgGameToListItem)
      .filter((g): g is GameListItem => g !== null);

    if (shouldLocalizeNamesToZh()) {
      games = await applyChineseDisplayNames(games);
    }

    return games;
  }

  async getGameListItem(gameId: string): Promise<GameListItem | null> {
    const apiKey = requireRawgKey();
    const raw = await fetchRawgGameById(gameId, apiKey);
    if (!raw) return null;

    let item = mapRawgGameToListItem(raw);
    if (!item) return null;

    if (shouldLocalizeNamesToZh()) {
      const [localized] = await applyChineseDisplayNames([item]);
      item = localized ?? item;
    }

    return item;
  }

  async getGameDetail(gameId: string) {
    const apiKey = requireRawgKey();
    return buildRawgGameDetail(gameId, apiKey);
  }
}
