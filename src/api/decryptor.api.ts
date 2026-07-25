import { DECRYPTOR_URL } from "@/lib/config"

export interface StreamSource {
  quality: string
  size?: string | null
  url: string
  type?: string
  headers?: Record<string, string> | null
  source?: string | null
}

export interface StreamSubtitle {
  lang: string
  language: string
  url: string
}

export interface UnifiedMediaMeta {
  title: string
  provider: string
  mediaType: "movie" | "tv"
  tmdbId?: string | null
  imdbId?: string | null
  year?: string | null
  cover?: string | null
}

export interface UnifiedEpisodeInfo {
  season?: number | null
  episode?: number | null
}

export interface UnifiedMediaResponse {
  meta: UnifiedMediaMeta
  episode?: UnifiedEpisodeInfo | null
  sources: StreamSource[]
  subtitles: StreamSubtitle[]
}

export interface DecryptorResult {
  provider: string
  meta?: UnifiedMediaMeta
  episode?: UnifiedEpisodeInfo | null
  sources: StreamSource[]
  subtitles: StreamSubtitle[]
}

export interface FetchSourcesParams {
  tmdbId: string
  title: string
  year: string
  mediaType: "movie" | "tv"
  provider: string
  imdbId?: string
  season?: number
  episode?: number
}

export async function fetchDecryptedSources(
  params: FetchSourcesParams
): Promise<DecryptorResult> {
  // ── 1. Handle Moviebox Provider ──
  if (params.provider.toLowerCase() === "moviebox") {
    let mbJson: UnifiedMediaResponse | null = null

    // Direct IMDB ID Reverse Lookup if imdbId is present
    if (params.imdbId && params.imdbId.startsWith("tt")) {
      const mbQs = new URLSearchParams({
        imdbId: params.imdbId,
        ...(params.season !== undefined
          ? { seasonId: String(params.season) }
          : {}),
        ...(params.episode !== undefined
          ? { episodeId: String(params.episode) }
          : {}),
      })

      const mbRes = await fetch(
        `${DECRYPTOR_URL}/moviebox/sources?${mbQs.toString()}`
      )
      if (mbRes.ok) {
        mbJson = (await mbRes.json()) as UnifiedMediaResponse
      }
    }

    // Fallback: search Moviebox catalog by title if imdbId is missing or yielded no sources
    if (!mbJson || !mbJson.sources || mbJson.sources.length === 0) {
      const searchRes = await fetch(
        `${DECRYPTOR_URL}/moviebox/search?q=${encodeURIComponent(params.title)}`
      )
      if (!searchRes.ok) {
        throw new Error(`Moviebox search failed for "${params.title}"`)
      }
      const searchJson = (await searchRes.json()) as {
        results?: Array<{
          subjectId: string
          title: string
          year: string
          subjectType: number
        }>
      }
      const results = searchJson.results ?? []
      if (results.length === 0) {
        throw new Error(
          `Moviebox: title "${params.title}" not found on Moviebox`
        )
      }

      // Match candidate by subjectType (1=movie, 2=tv) and year
      const targetType = params.mediaType === "tv" ? 2 : 1
      const candidate =
        results.find(
          (r) =>
            r.subjectType === targetType &&
            params.year &&
            r.year === params.year
        ) ||
        results.find((r) => r.subjectType === targetType) ||
        results[0]

      const mbQs = new URLSearchParams({
        subjectId: candidate.subjectId,
        ...(params.season !== undefined
          ? { seasonId: String(params.season) }
          : {}),
        ...(params.episode !== undefined
          ? { episodeId: String(params.episode) }
          : {}),
      })

      const mbRes = await fetch(
        `${DECRYPTOR_URL}/moviebox/sources?${mbQs.toString()}`
      )
      if (!mbRes.ok) {
        const body = (await mbRes.json().catch(() => ({}))) as {
          detail?: string
        }
        throw new Error(body.detail ?? `Moviebox HTTP ${mbRes.status}`)
      }
      mbJson = (await mbRes.json()) as UnifiedMediaResponse
    }

    return {
      provider: "Moviebox",
      meta: mbJson.meta,
      episode: mbJson.episode,
      sources: mbJson.sources ?? [],
      subtitles: mbJson.subtitles ?? [],
    }
  }

  // ── 2. Handle Videasy / Wingsdatabase Providers (Yoru, Neon, Cypher, Breach) ──
  const qs = new URLSearchParams({
    tmdbId: params.tmdbId,
    mediaType: params.mediaType,
    title: params.title,
    provider: params.provider,
    ...(params.year ? { year: params.year } : {}),
    ...(params.imdbId ? { imdbId: params.imdbId } : {}),
    ...(params.season !== undefined ? { seasonId: String(params.season) } : {}),
    ...(params.episode !== undefined
      ? { episodeId: String(params.episode) }
      : {}),
  })

  const res = await fetch(`${DECRYPTOR_URL}/sources?${qs.toString()}`)

  if (res.status === 429) {
    throw new Error("Rate limited by upstream — please wait and retry")
  }
  if (res.status === 502) {
    throw new Error(`Provider ${params.provider} failed — upstream error`)
  }
  if (res.status === 504) {
    throw new Error(`Provider ${params.provider} timed out`)
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string }
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }

  const json = (await res.json()) as UnifiedMediaResponse & {
    data?: { sources: StreamSource[]; subtitles: StreamSubtitle[] }
  }

  if (json.meta) {
    return {
      provider: json.meta.provider || params.provider,
      meta: json.meta,
      episode: json.episode,
      sources: json.sources ?? [],
      subtitles: json.subtitles ?? [],
    }
  }

  return {
    provider: params.provider,
    sources: json.data?.sources ?? [],
    subtitles: json.data?.subtitles ?? [],
  }
}

// ── Wyzie Subtitles ──────────────────────────────────────────────────────────

export interface WyzieSubtitle {
  id: string
  url: string
  flagUrl: string
  format: string
  encoding: string
  display: string
  language: string
  media: string
  isHearingImpaired: boolean
  source: string
  release: string
  releases: string[]
  fileName: string
  downloadCount: number
  origin: string
  ai: boolean
}

export interface WyzieSubtitleGroup {
  language: string
  display: string
  flagUrl: string
  subtitles: WyzieSubtitle[]
}

export interface FetchWyzieParams {
  tmdbId?: string
  imdbId?: string
  mediaType?: "movie" | "tv"
  season?: number
  episode?: number
  language?: string
}

export async function fetchWyzieSubtitles(
  params: FetchWyzieParams
): Promise<WyzieSubtitleGroup[]> {
  const qs = new URLSearchParams()

  if (params.tmdbId) qs.set("tmdbId", params.tmdbId)
  if (params.imdbId) qs.set("imdbId", params.imdbId)
  if (params.language) qs.set("language", params.language)
  if (params.season !== undefined) qs.set("season", String(params.season))
  if (params.episode !== undefined) qs.set("episode", String(params.episode))

  const res = await fetch(`${DECRYPTOR_URL}/wyzie?${qs.toString()}`)

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string }
    throw new Error(body.detail ?? `Wyzie HTTP ${res.status}`)
  }

  const data = (await res.json()) as WyzieSubtitleGroup[]
  return data
}
