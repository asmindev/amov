export const SLIDE_INTERVAL = 6000
export const HOVER_VIDEO_DELAY = 1 * 1000 // 2 seconds
export const HERO_MAX_VISIBLE = 8

// Watch provider and region settings
export const NETFLIX_PROVIDER_ID = "8"
export const WATCH_REGION = "ID"
export const DEFAULT_SORT_BY = "popularity.desc"

// Videasy Decryptor backend URL (direct connection to FastAPI backend for fast HTTP/2 video streaming)
export const DECRYPTOR_URL =
  import.meta.env.VITE_DECRYPTOR_URL || "http://localhost:8000"
export const DECRYPTOR_PROVIDERS = [
  "Yoru",
  "Moviebox",
  "Neon",
  "Cypher",
  "Breach",
] as const
export type DecryptorProvider = (typeof DECRYPTOR_PROVIDERS)[number]
