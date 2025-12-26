import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const markdowns = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/markdowns" }),
  schema: z.object({
    parent: z.string(),
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
  })
});

export const collections = { markdowns };
