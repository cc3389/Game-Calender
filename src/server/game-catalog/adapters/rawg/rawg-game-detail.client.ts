import {
  rawgGameDetailSchema,
  rawgMoviesResponseSchema,
  rawgScreenshotsResponseSchema,
} from "./rawg-game-detail.schema";

const RAWG_BASE = "https://api.rawg.io/api";

async function fetchRawgJson<T>(
  url: string,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`RAWG request failed: ${res.status} ${res.statusText}`);
  }
  const json: unknown = await res.json();
  return schema.parse(json);
}

export async function fetchRawgGameDetailMeta(
  gameId: string,
  apiKey: string,
) {
  const url = `${RAWG_BASE}/games/${encodeURIComponent(gameId)}?key=${encodeURIComponent(apiKey)}`;
  return fetchRawgJson(url, rawgGameDetailSchema);
}

export async function fetchRawgGameScreenshots(
  gameId: string,
  apiKey: string,
) {
  const url =
    `${RAWG_BASE}/games/${encodeURIComponent(gameId)}/screenshots?key=` +
    encodeURIComponent(apiKey);
  const data = await fetchRawgJson(url, rawgScreenshotsResponseSchema);
  return data.results;
}

export async function fetchRawgGameMovies(gameId: string, apiKey: string) {
  const url =
    `${RAWG_BASE}/games/${encodeURIComponent(gameId)}/movies?key=` +
    encodeURIComponent(apiKey);
  const data = await fetchRawgJson(url, rawgMoviesResponseSchema);
  return data.results;
}
