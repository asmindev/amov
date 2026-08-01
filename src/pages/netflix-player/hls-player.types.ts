import type { StreamSource, StreamSubtitle } from "@/api/decryptor.api"
import type { DecryptorProvider } from "@/lib/config"
import type { DECRYPTOR_PROVIDERS } from "@/lib/config"
import type { TvSeason } from "@/types/movie.types"

export interface WatchpartyPlayerProps {
  roomId: string
  roomSlug: string
  userId: string
  displayName?: string
}

export interface HlsPlayerProps {
  sources: StreamSource[]
  subtitles: StreamSubtitle[]
  movieId: number
  movieTitle: string
  movieYear: string
  poster?: string
  provider: DecryptorProvider
  providerIndex: number
  allProviders: typeof DECRYPTOR_PROVIDERS
  onProviderChange: (index: number) => void
  onRefetchCurrentProvider?: () => void
  isFetchingProvider: boolean
  imdbId?: string
  movieOverview?: string
  popularity?: number
  voteAverage?: number
  logoPath?: string | null
  mediaType?: "movie" | "tv"
  season?: number
  episode?: number
  seasons?: TvSeason[]
  watchparty?: WatchpartyPlayerProps
}
