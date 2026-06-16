import type { GameListItem } from "@/entities/game/types";
import type { GameDetailMedia } from "@/entities/game/detail-types";

export type FetchGamesResponse = {
  month: string;
  provider: string;
  games: GameListItem[];
};

export async function fetchGamesByMonth(
  month: string,
  platformIds: number[],
): Promise<FetchGamesResponse> {
  const params = new URLSearchParams({ month });
  if (platformIds.length > 0) {
    params.set("platforms", platformIds.join(","));
  }

  const res = await fetch(`/api/games?${params.toString()}`);
  const data: unknown = await res.json();

  if (!res.ok) {
    const err =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed (${res.status})`;
    throw new Error(err);
  }

  return data as FetchGamesResponse;
}

export type FetchGameDetailResponse = {
  provider: string;
  detail: GameDetailMedia;
};

export async function fetchGameDetail(
  gameId: string,
): Promise<FetchGameDetailResponse> {
  const res = await fetch(`/api/games/${encodeURIComponent(gameId)}`);
  const data: unknown = await res.json();

  if (!res.ok) {
    const err =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed (${res.status})`;
    throw new Error(err);
  }

  return data as FetchGameDetailResponse;
}
