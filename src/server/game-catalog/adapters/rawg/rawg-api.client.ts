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
