import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import {
  rawgGameSchema,
  rawgGamesResponseSchema,
  type RawgGame,
} from "./rawg.schema";

const RAWG_BASE = "https://api.rawg.io/api";

function monthToDateRange(month: string): { from: string; to: string } {
  const base = parse(`${month}-01`, "yyyy-MM-dd", new Date());
  return {
    from: format(startOfMonth(base), "yyyy-MM-dd"),
    to: format(endOfMonth(base), "yyyy-MM-dd"),
  };
}

export async function fetchRawgGamesForMonth(
  month: string,
  platformIds: number[] | undefined,
  apiKey: string,
): Promise<RawgGame[]> {
  const { from, to } = monthToDateRange(month);
  const all: RawgGame[] = [];
  let url: string | null =
    `${RAWG_BASE}/games?key=${encodeURIComponent(apiKey)}` +
    `&dates=${from},${to}` +
    `&page_size=40` +
    (platformIds?.length
      ? `&platforms=${platformIds.join(",")}`
      : "");

  while (url) {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      throw new Error(`RAWG request failed: ${res.status} ${res.statusText}`);
    }
    const json: unknown = await res.json();
    const parsed = rawgGamesResponseSchema.parse(json);
    for (const item of parsed.results) {
      all.push(rawgGameSchema.parse(item));
    }
    url = parsed.next;
  }

  return all;
}

export async function fetchRawgGameById(
  gameId: string,
  apiKey: string,
): Promise<RawgGame | null> {
  const url =
    `${RAWG_BASE}/games/${encodeURIComponent(gameId)}?key=` +
    encodeURIComponent(apiKey);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`RAWG request failed: ${res.status} ${res.statusText}`);
  }
  const json: unknown = await res.json();
  return rawgGameSchema.parse(json);
}

export async function fetchRawgGamesSearch(
  search: string,
  platformIds: number[] | undefined,
  apiKey: string,
  pageSize = 20,
): Promise<RawgGame[]> {
  const trimmed = search.trim();
  if (!trimmed) return [];

  let url: string | null =
    `${RAWG_BASE}/games?key=${encodeURIComponent(apiKey)}` +
    `&search=${encodeURIComponent(trimmed)}` +
    `&page_size=${Math.min(40, Math.max(1, pageSize))}` +
    (platformIds?.length ? `&platforms=${platformIds.join(",")}` : "");

  const all: RawgGame[] = [];
  while (url && all.length < pageSize) {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`RAWG request failed: ${res.status} ${res.statusText}`);
    }
    const json: unknown = await res.json();
    const parsed = rawgGamesResponseSchema.parse(json);
    for (const item of parsed.results) {
      all.push(rawgGameSchema.parse(item));
      if (all.length >= pageSize) break;
    }
    url = all.length >= pageSize ? null : parsed.next;
  }

  return all;
}
