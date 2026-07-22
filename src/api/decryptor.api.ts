import { DECRYPTOR_URL } from "@/lib/config"

export interface StreamSource {
  quality: string
  url: string
}

export interface StreamSubtitle {
  lang: string
  language: string
  url: string
}

export interface DecryptorResult {
  provider: string
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
  const qs = new URLSearchParams({
    tmdbId: params.tmdbId,
    mediaType: params.mediaType,
    title: params.title,
    provider: params.provider,
    ...(params.year ? { year: params.year } : {}),
    ...(params.imdbId ? { imdbId: params.imdbId } : {}),
    ...(params.season !== undefined ? { season: String(params.season) } : {}),
    ...(params.episode !== undefined ? { episode: String(params.episode) } : {}),
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

  const json = (await res.json()) as {
    tmdbId: string
    provider: string
    data: { sources: StreamSource[]; subtitles: StreamSubtitle[] }
  }

  return {
    provider: json.provider,
    sources: json.data.sources,
    subtitles: json.data.subtitles,
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
