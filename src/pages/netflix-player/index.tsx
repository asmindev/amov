import { useEffect } from "react"
import { useParams, useSearch, Link } from "@tanstack/react-router"
import { useMediaDetail } from "@/pages/movie-detail/hooks/use-movie-detail"
import { useSources } from "./hooks/use-sources"
import { HlsPlayer } from "./partials/hls-player"
import { MoviePendingSkeleton, SourceLoadingOverlay } from "./partials/loading-animations"
import { getBackdropUrl as getBdUrl } from "@/helpers/image-url"
import { recordAnalyticsEvent } from "@/api/analytics.api"

// Safe year extractor — must return "YYYY" or "" (API regex: ^\d{4}$|^$)
function safeYear(releaseDate: string | null | undefined): string {
  if (!releaseDate) return ""
  const y = new Date(releaseDate).getFullYear()
  return isNaN(y) ? "" : String(y)
}

export default function NetflixPlayerPage() {
  const params = useParams({ strict: false }) as { type?: string; id?: string }
  const mediaType: "movie" | "tv" = params.type === "tv" ? "tv" : "movie"
  const id = params.id || ""

  const search = useSearch({ strict: false }) as {
    season?: number
    episode?: number
  }
  const season = search.season ?? 1
  const episode = search.episode ?? 1

  const {
    data: movie,
    isPending: moviePending,
    isError: movieError,
  } = useMediaDetail(mediaType, id)

  const {
    data: sources,
    isPending: sourcesPending,
    isError: sourcesError,
    error: sourcesErrorObj,
    provider,
    providerIndex,
    setProviderIndex,
    allProviders,
    refetch,
  } = useSources(
    movie
      ? {
          tmdbId: String(movie.id),
          title: movie.title,
          year: safeYear(movie.releaseDate),
          mediaType,
          imdbId: movie.imdbId ?? undefined,
          season: mediaType === "tv" ? season : undefined,
          episode: mediaType === "tv" ? episode : undefined,
        }
      : {
          tmdbId: id,
          title: "",
          year: "",
          mediaType,
        }
  )

  const posterUrl = movie?.backdropPath
    ? getBdUrl(movie.backdropPath, "w1280")
    : undefined

  useEffect(() => {
    if (movie) {
      void recordAnalyticsEvent({
        eventType: "movie_play",
        mediaId: String(movie.id),
        mediaTitle: movie.title,
        mediaType,
      })
    }
  }, [movie, mediaType])

  // ── Loading state ────────────────────────────────────────────────────────
  if (moviePending) {
    return <MoviePendingSkeleton />
  }

  if (movieError || !movie) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black">
        <span className="material-symbols-outlined !text-[40px] text-red-400">warning</span>
        <p className="font-semibold text-white">Could not load details</p>
        <Link
          to="/$type/$id"
          params={{ type: mediaType, id }}
          className="text-sm text-white/50 underline transition-colors hover:text-white"
        >
          Back to details
        </Link>
      </div>
    )
  }

  // ── All providers exhausted ──────────────────────────────────────────────
  if (sourcesError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black px-6">
        <span className="material-symbols-outlined !text-[48px] text-red-400">dns_off</span>
        <h2 className="text-center text-xl font-bold text-white">
          All providers failed
        </h2>
        <p className="max-w-sm text-center text-sm text-white/50">
          {sourcesErrorObj?.message ?? "Could not fetch a working stream."}
        </p>
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => setProviderIndex(0)}
            className="rounded-lg bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Retry from Yoru
          </button>
          <Link
            to="/$type/$id"
            params={{ type: mediaType, id }}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
          >
            Back to detail
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* ── HLS Player ── */}
      {sources ? (
        <HlsPlayer
          sources={sources.sources}
          subtitles={sources.subtitles}
          movieId={movie.id}
          movieTitle={movie.title}
          movieYear={safeYear(movie.releaseDate)}
          poster={posterUrl}
          provider={provider}
          providerIndex={providerIndex}
          allProviders={allProviders}
          onProviderChange={setProviderIndex}
          onRefetchCurrentProvider={refetch}
          isFetchingProvider={sourcesPending}
          imdbId={movie?.imdbId ?? undefined}
          movieOverview={movie.overview}
          popularity={movie.popularity}
          voteAverage={movie.voteAverage}
          logoPath={movie.logoPath}
          mediaType={mediaType}
          season={season}
          episode={episode}
          seasons={movie.seasons}
        />
      ) : (
        <SourceLoadingOverlay
          posterUrl={posterUrl}
          title={movie.title}
          provider={provider}
        />
      )}
    </div>
  )
}
