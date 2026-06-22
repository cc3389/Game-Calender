import type {
  GameDetailMedia,
  GameMediaSlide,
  GameScreenshot,
  GameVideo,
} from "@/entities/game/detail-types";
import type { z } from "zod";
import {
  fetchRawgGameDetailMeta,
  fetchRawgGameMovies,
  fetchRawgGameScreenshots,
} from "./rawg-game-detail.client";
import type { rawgGameDetailSchema } from "./rawg-game-detail.schema";
import {
  fetchSteamAppExtras,
  resolveSteamAppIdByName,
  stripHtmlToText,
} from "./steam-app-details";

const MAX_SCREENSHOTS = 12;
const MAX_VIDEOS = 4;
const MAX_TAGS = 16;

type RawgMeta = z.infer<typeof rawgGameDetailSchema>;

function collectRawgTags(meta: RawgMeta): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const g of meta.genres ?? []) {
    const key = g.slug.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(g.name);
    }
  }

  for (const t of meta.tags ?? []) {
    if (t.language && t.language !== "eng") continue;
    const key = t.slug.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t.name);
  }

  return out.slice(0, MAX_TAGS);
}

function mergeTags(rawgTags: string[], steamGenres: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of [...steamGenres, ...rawgTags]) {
    const key = label.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label.trim());
  }
  return out.slice(0, MAX_TAGS);
}

function buildSlides(
  videos: GameVideo[],
  screenshots: GameScreenshot[],
): GameMediaSlide[] {
  const slides: GameMediaSlide[] = [];

  for (const v of videos) {
    slides.push({
      kind: "video",
      id: v.id,
      name: v.name,
      thumbUrl: v.previewUrl,
      mp4Url: v.videoUrl,
      hlsUrl: v.hlsUrl,
    });
  }

  for (const s of screenshots) {
    slides.push({
      kind: "image",
      id: s.id,
      url: s.url,
      thumbUrl: s.thumbUrl ?? s.url,
    });
  }

  return slides;
}

export async function buildRawgGameDetail(
  gameId: string,
  apiKey: string,
): Promise<GameDetailMedia> {
  const [meta, screenshotsRaw, moviesRaw] = await Promise.all([
    fetchRawgGameDetailMeta(gameId, apiKey),
    fetchRawgGameScreenshots(gameId, apiKey).catch(() => []),
    fetchRawgGameMovies(gameId, apiKey).catch(() => []),
  ]);

  const rawDesc = meta.description_raw ?? meta.description ?? "";
  const descriptionEn = rawDesc ? stripHtmlToText(rawDesc) : null;

  let descriptionZh: string | null = null;
  let descriptionZhHtml: string | null = null;
  let steamGenres: string[] = [];

  const videos: GameVideo[] = moviesRaw.slice(0, MAX_VIDEOS).map((m) => ({
    id: String(m.id),
    name: m.name,
    previewUrl: m.preview ?? null,
    videoUrl: m.data?.max ?? m.data?.["480"] ?? undefined,
  }));

  const screenshotByUrl = new Map<string, GameScreenshot>();
  for (const s of screenshotsRaw) {
    screenshotByUrl.set(s.image, {
      id: String(s.id),
      url: s.image,
      thumbUrl: s.image,
    });
  }

  const steamAppId = await resolveSteamAppIdByName(meta.name);
  if (steamAppId) {
    const steam = await fetchSteamAppExtras(steamAppId);
    descriptionZh = steam.short;
    descriptionZhHtml = steam.detailedHtml;
    steamGenres = steam.genreLabels;
    if (!descriptionZh && descriptionZhHtml) {
      descriptionZh = stripHtmlToText(descriptionZhHtml).slice(0, 500);
    }

    for (const m of steam.movies.slice(0, MAX_VIDEOS)) {
      if (videos.length >= MAX_VIDEOS) break;
      if (!m.hls_h264) continue;
      const id = `steam-${m.id}`;
      if (videos.some((v) => v.id === id)) continue;
      videos.push({
        id,
        name: m.name,
        previewUrl: m.thumbnail ?? null,
        hlsUrl: m.hls_h264,
      });
    }

    for (const s of steam.screenshots) {
      if (screenshotByUrl.size >= MAX_SCREENSHOTS) break;
      if (screenshotByUrl.has(s.path_full)) continue;
      screenshotByUrl.set(s.path_full, {
        id: `steam-${s.id}`,
        url: s.path_full,
        thumbUrl: s.path_thumbnail ?? s.path_full,
      });
    }
  }

  const screenshots = [...screenshotByUrl.values()].slice(0, MAX_SCREENSHOTS);
  const tags = mergeTags(collectRawgTags(meta), steamGenres);

  return {
    id: String(meta.id),
    tags,
    descriptionEn,
    descriptionZh,
    descriptionZhHtml,
    screenshots,
    videos: videos.filter((v) => v.videoUrl || v.hlsUrl),
    slides: buildSlides(
      videos.filter((v) => v.videoUrl || v.hlsUrl),
      screenshots,
    ),
  };
}
