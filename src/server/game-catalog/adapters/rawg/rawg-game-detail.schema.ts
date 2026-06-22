import { z } from "zod";

export const rawgScreenshotSchema = z.object({
  id: z.number(),
  image: z.string(),
});

export const rawgScreenshotsResponseSchema = z.object({
  results: z.array(rawgScreenshotSchema),
});

export const rawgMovieSchema = z.object({
  id: z.number(),
  name: z.string(),
  preview: z.string().optional(),
  data: z
    .object({
      max: z.string().optional(),
      "480": z.string().optional(),
    })
    .optional(),
});

export const rawgMoviesResponseSchema = z.object({
  results: z.array(rawgMovieSchema),
});

const rawgTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  language: z.string().optional(),
});

export const rawgGameDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description_raw: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(rawgTagSchema).nullish(),
  genres: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
      }),
    )
    .nullish(),
});
