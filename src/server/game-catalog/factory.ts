import type { GameCatalogPort } from "./port";
import { RawgGameCatalogAdapter } from "./adapters/rawg/rawg-game-catalog.adapter";
import { TwitchGameCatalogAdapter } from "./adapters/twitch/twitch-game-catalog.adapter";

export type GameCatalogProviderId = "rawg" | "twitch";

const providers: Record<GameCatalogProviderId, () => GameCatalogPort> = {
  rawg: () => new RawgGameCatalogAdapter(),
  twitch: () => new TwitchGameCatalogAdapter(),
};

function resolveProviderId(): GameCatalogProviderId {
  const raw = process.env.GAME_CATALOG_PROVIDER?.toLowerCase();
  if (raw === "twitch") return "twitch";
  return "rawg";
}

let cached: GameCatalogPort | null = null;

export function getGameCatalogPort(): GameCatalogPort {
  if (!cached) {
    const id = resolveProviderId();
    cached = providers[id]();
  }
  return cached;
}

/** 测试或热切换时重置单例 */
export function resetGameCatalogPortForTests(): void {
  cached = null;
}
