import { z } from "zod";

const steamSearchItemSchema = z.object({
  type: z.string(),
  name: z.string(),
  id: z.number(),
});

const steamSearchResponseSchema = z.object({
  items: z.array(steamSearchItemSchema).optional(),
});

export type SteamSearchHit = z.infer<typeof steamSearchItemSchema>;

export async function searchSteamStore(
  term: string,
  language: "schinese" | "english",
): Promise<SteamSearchHit[]> {
  const url =
    "https://store.steampowered.com/api/storesearch/?" +
    new URLSearchParams({
      term,
      l: language,
      cc: language === "schinese" ? "CN" : "US",
    }).toString();

  const res = await fetch(url, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const json: unknown = await res.json();
  const parsed = steamSearchResponseSchema.safeParse(json);
  if (!parsed.success) return [];
  return parsed.data.items ?? [];
}
