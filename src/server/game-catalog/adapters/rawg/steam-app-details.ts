import { z } from "zod";
import { searchSteamStore } from "./steam-store-search";

const steamMovieSchema = z.object({
  id: z.number(),
  name: z.string(),
  thumbnail: z.string().optional(),
  hls_h264: z.string().optional(),
});

const steamScreenshotSchema = z.object({
  id: z.number(),
  path_full: z.string(),
  path_thumbnail: z.string().optional(),
});

const steamAppDataSchema = z.object({
  short_description: z.string().optional(),
  detailed_description: z.string().optional(),
  movies: z.array(steamMovieSchema).optional(),
  screenshots: z.array(steamScreenshotSchema).optional(),
  genres: z.array(z.object({ description: z.string() })).optional(),
});

const steamAppDetailsSchema = z.object({
  success: z.boolean(),
  data: steamAppDataSchema.optional(),
});

export type SteamAppExtras = {
  short: string | null;
  detailedHtml: string | null;
  genreLabels: string[];
  movies: z.infer<typeof steamMovieSchema>[];
  screenshots: z.infer<typeof steamScreenshotSchema>[];
};

async function fetchSteamAppRoot(appId: number, lang: "schinese" | "english") {
  const url =
    "https://store.steampowered.com/api/appdetails?" +
    new URLSearchParams({
      appids: String(appId),
      l: lang,
      cc: lang === "schinese" ? "CN" : "US",
    }).toString();

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const json: unknown = await res.json();
  const root =
    typeof json === "object" && json !== null
      ? (json as Record<string, unknown>)[String(appId)]
      : undefined;
  const parsed = steamAppDetailsSchema.safeParse(root);
  if (!parsed.success || !parsed.data.success || !parsed.data.data) {
    return null;
  }
  return parsed.data.data;
}

export async function resolveSteamAppIdByName(
  englishName: string,
): Promise<number | null> {
  const query = englishName.trim();
  if (!query) return null;

  const [cnHits, enHits] = await Promise.all([
    searchSteamStore(query, "schinese"),
    searchSteamStore(query, "english"),
  ]);
  const cnTop = cnHits.find((h) => h.type === "app");
  const enTop = enHits.find((h) => h.type === "app");
  if (cnTop && enTop && cnTop.id === enTop.id) return cnTop.id;
  if (enTop?.type === "app") return enTop.id;
  if (cnTop?.type === "app") return cnTop.id;
  return null;
}

export async function fetchSteamAppExtras(
  appId: number,
): Promise<SteamAppExtras> {
  const data = await fetchSteamAppRoot(appId, "schinese");
  if (!data) {
    return {
      short: null,
      detailedHtml: null,
      genreLabels: [],
      movies: [],
      screenshots: [],
    };
  }

  const short = data.short_description?.trim() || null;
  const detailed = data.detailed_description?.trim() || null;

  return {
    short,
    detailedHtml: detailed ? sanitizeBasicHtml(detailed) : null,
    genreLabels: (data.genres ?? []).map((g) => g.description).filter(Boolean),
    movies: data.movies ?? [],
    screenshots: data.screenshots ?? [],
  };
}

/** @deprecated use fetchSteamAppExtras */
export async function fetchSteamChineseDescriptions(appId: number): Promise<{
  short: string | null;
  detailedHtml: string | null;
}> {
  const extras = await fetchSteamAppExtras(appId);
  return { short: extras.short, detailedHtml: extras.detailedHtml };
}

export function sanitizeBasicHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
