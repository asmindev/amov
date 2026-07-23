import { DECRYPTOR_URL } from "@/lib/config"

export interface StreamSource {
  quality: string
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
    // Search Moviebox by title to resolve subjectId
    const searchRes = await fetch(`${DECRYPTOR_URL}/moviebox/search?q=${encodeURIComponent(params.title)}`)
    if (!searchRes.ok) {
      throw new Error(`Moviebox search failed for "${params.title}"`)
    }
    const searchJson = (await searchRes.json()) as {
      results?: Array<{ subjectId: string; title: string; year: string; subjectType: number }>
    }
    const results = searchJson.results ?? []
    if (results.length === 0) {
      throw new Error(`Moviebox: no search results found for "${params.title}"`)
    }

    // Match candidate by year and subjectType
    const targetType = params.mediaType === "tv" ? 2 : 1
    const candidate =
      results.find((r) => r.subjectType === targetType && params.year && r.year === params.year) ||
      results.find((r) => r.subjectType === targetType) ||
      results[0]

    const mbQs = new URLSearchParams({
      subjectId: candidate.subjectId,
      seasonId: String(params.season ?? 1),
      episodeId: String(params.episode ?? 1),
    })

    const mbRes = await fetch(`${DECRYPTOR_URL}/moviebox/sources?${mbQs.toString()}`)
    if (!mbRes.ok) {
      const body = (await mbRes.json().catch(() => ({}))) as { detail?: string }
      throw new Error(body.detail ?? `Moviebox HTTP ${mbRes.status}`)
    }

    const mbJson = (await mbRes.json()) as UnifiedMediaResponse
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
    ...(params.episode !== undefined ? { episodeId: String(params.episode) } : {}),
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

  // New UnifiedMediaResponse format
  if (json.meta) {
    return {
      provider: json.meta.provider || params.provider,
      meta: json.meta,
      episode: json.episode,
      sources: json.sources ?? [],
      subtitles: json.subtitles ?? [],
    }
  }

  // Fallback for legacy format
  return {
    provider: params.provider,
    sources: json.data?.sources ?? [],
    subtitles: json.data?.subtitles ?? [],
  }
}

export async function fetchProviderSubtitles(
  provider: string,
  params: Omit<FetchSourcesParams, "provider">
): Promise<StreamSubtitle[]> {
  const qs = new URLSearchParams({
    tmdbId: params.tmdbId,
    mediaType: params.mediaType,
    title: params.title,
    ...(params.year ? { year: params.year } : {}),
    ...(params.imdbId ? { imdbId: params.imdbId } : {}),
  })

  const res = await fetch(
    `${DECRYPTOR_URL}/subtitles/${provider.toLowerCase()}?${qs.toString()}`
  )

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string }
    throw new Error(body.detail ?? `Gagal mengambil subtitle dari ${provider}`)
  }

  const json = (await res.json()) as { subtitles: StreamSubtitle[] }
  return json.subtitles
}

export async function fetchOpenSubtitles(
  imdbId: string
): Promise<StreamSubtitle[]> {
  const qs = new URLSearchParams({ imdbId })
  const res = await fetch(`${DECRYPTOR_URL}/opensubtitles?${qs.toString()}`)

  if (!res.ok) {
    throw new Error("Gagal mengambil external subtitles dari OpenSubtitles")
  }

  const json = (await res.json()) as StreamSubtitle[]
  return json
}
