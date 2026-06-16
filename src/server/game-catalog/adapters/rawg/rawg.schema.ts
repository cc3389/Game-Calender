import { z } from "zod";

const platformEntrySchema = z.object({
  platform: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

const storeEntrySchema = z.object({
  store: z.object({
    name: z.string(),
  }),
  url: z.string().optional(),
});

const tagEntrySchema = z.object({
  slug: z.string(),
  name: z.string().optional(),
});

export const rawgGameSchema = z.object({
  id: z.number(),
  name: z.string(),
  released: z.string().nullable().optional(),
  background_image: z.string().nullable().optional(),
  platforms: z.array(platformEntrySchema).nullish(),
  stores: z.array(storeEntrySchema).nullish(),
  tags: z.array(tagEntrySchema).nullish(),
});

export const rawgGamesResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  results: z.array(rawgGameSchema),
});

export type RawgGame = z.infer<typeof rawgGameSchema>;
