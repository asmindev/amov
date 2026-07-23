import { fetchProviderSubtitles } from "@/api/decryptor.api"
import type { StreamSubtitle } from "@/api/decryptor.api"

interface FetchProviderSubtitlesInput {
  provider: string
  imdbId?: string
  movieId: number
  movieTitle: string
  movieYear: string
}

export async function fetchProviderSubtitlesForMovie({
  provider,
  imdbId,
  movieId,
  movieTitle,
  movieYear,
}: FetchProviderSubtitlesInput): Promise<StreamSubtitle[]> {
  if (provider === "opensubtitles" && !imdbId) {
    throw new Error(
      "IMDB ID tidak tersedia untuk film ini. OpenSubtitles membutuhkan IMDB ID."
    )
  }

  return fetchProviderSubtitles(provider, {
    tmdbId: movieId.toString(),
    title: movieTitle,
    year: movieYear,
    mediaType: "movie",
    imdbId: imdbId || undefined,
  })
}
