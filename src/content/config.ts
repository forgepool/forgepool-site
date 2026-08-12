import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",

  schema: z.object({
    articleId: z.string().uuid(),

    title: z.string(),

    description: z.string(),

    date: z.coerce.date(),

    publishedAt: z.coerce.date().optional(),

    labelId: z.string().uuid(),

    featured: z.boolean().default(false),

    draft: z.boolean().default(false),

    cover: z.string().optional(),

    coverAlt: z.string().optional(),
  }),
});

export const collections = {
  blog,
};
