import type { GameListItem } from "@/entities/game/types";
import { pickChineseFromSlashName } from "./display-name-locale";
import type { RawgGame } from "./rawg.schema";

export function mapRawgGameToListItem(game: RawgGame): GameListItem | null {
  if (!game.released) return null;

  const rawName = game.name.trim();
  const platformNames = (game.platforms ?? []).map((p) => p.platform.name);
  const storeLinks = (game.stores ?? [])
    .filter((s) => s.url)
    .map((s) => ({
      name: s.store.name,
      url: s.url as string,
    }));

  const slashName = pickChineseFromSlashName(rawName);

  return {
    id: String(game.id),
    name: slashName,
    nameOriginal: slashName !== rawName ? rawName : undefined,
    released: game.released,
    coverUrl: game.background_image ?? null,
    platformNames,
    storeLinks,
    sourceProvider: "rawg",
  };
}
