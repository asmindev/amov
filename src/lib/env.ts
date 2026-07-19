import { z } from "zod"

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_MOVIE_API_TOKEN: z.string().min(1),
  VITE_IMAGE_BASE_URL: z.string().url(),
})

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_MOVIE_API_TOKEN: import.meta.env.VITE_MOVIE_API_TOKEN,
  VITE_IMAGE_BASE_URL: import.meta.env.VITE_IMAGE_BASE_URL,
})
