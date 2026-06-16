import type { GameListItem } from "@/entities/game/types";
import { GameCatalogConfigError } from "../../errors";
import type { GameCatalogPort, ListReleasesQuery } from "../../port";
import { shouldLocalizeNamesToZh } from "./display-name-locale";
import { fetchRawgGamesForMonth } from "./rawg-api.client";
import { mapRawgGameToListItem } from "./map-rawg-game";
import { applyChineseDisplayNames } from "./resolve-zh-display-name";

export class RawgGameCatalogAdapter implements GameCatalogPort {
  readonly providerId = "rawg";

  async listReleasesByMonth(query: ListReleasesQuery): Promise<GameListItem[]> {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) {
      throw new GameCatalogConfigError(
        "RAWG_API_KEY is not configured. Add it to .env.local or switch GAME_CATALOG_PROVIDER.",
      );
    }

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
}
