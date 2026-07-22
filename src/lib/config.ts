export const SLIDE_INTERVAL = 6000
export const HOVER_VIDEO_DELAY = 1 * 1000 // 2 seconds
export const HERO_MAX_VISIBLE = 8

// Watch provider and region settings
export const NETFLIX_PROVIDER_ID = "8"
export const WATCH_REGION = "ID"
export const DEFAULT_SORT_BY = "popularity.desc"

// Videasy Decryptor backend (proxied via Vite dev server to avoid CORS)
// Vite forwards /api/decryptor/* → http://localhost:8000/*
export const DECRYPTOR_URL = "/api/decryptor"
export const DECRYPTOR_PROVIDERS = ["Yoru", "Neon", "Cypher", "Breach"] as const
export type DecryptorProvider = (typeof DECRYPTOR_PROVIDERS)[number]
