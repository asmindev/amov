import { useParams, Link } from "@tanstack/react-router"
import { AlertTriangle, ServerCrash } from "lucide-react"
import { useMovieDetail } from "@/pages/movie-detail/hooks/use-movie-detail"
import { useSources } from "./hooks/use-sources"
import { HlsPlayer } from "./partials/hls-player"
import { getBackdropUrl as getBdUrl } from "@/helpers/image-url"

// Safe year extractor — must return "YYYY" or "" (API regex: ^\d{4}$|^$)
function safeYear(releaseDate: string | null | undefined): string {
  if (!releaseDate) return ""
  const y = new Date(releaseDate).getFullYear()
  return isNaN(y) ? "" : String(y)
}

export default function NetflixPlayerPage() {
  const { id } = useParams({ from: "/movie/$id/netflix" })
  const {
    data: movie,
    isPending: moviePending,
    isError: movieError,
  } = useMovieDetail(id)

  const {
    data: sources,
    isPending: sourcesPending,
    isError: sourcesError,
    error: sourcesErrorObj,
    provider,
    providerIndex,
    setProviderIndex,
    allProviders,
  } = useSources(
    movie
      ? {
          tmdbId: String(movie.id),
          title: movie.title,
          year: safeYear(movie.releaseDate),
          mediaType: "movie",
          imdbId: movie.imdbId ?? undefined,
        }
      : {
          tmdbId: id,
          title: "",
          year: "",
          mediaType: "movie",
        }
  )

  const posterUrl = movie?.backdropPath
    ? getBdUrl(movie.backdropPath, "w1280")
    : undefined

  // ── Loading state ────────────────────────────────────────────────────────
  if (moviePending) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-red-500" />
          <p className="text-sm text-white/60">Loading movie…</p>
        </div>
      </div>
    )
  }

  if (movieError || !movie) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="font-semibold text-white">Could not load movie details</p>
        <Link
          to="/movie/$id"
          params={{ id }}
          className="text-sm text-white/50 underline transition-colors hover:text-white"
        >
          Back to movie
        </Link>
      </div>
    )
  }

  // ── All providers exhausted ──────────────────────────────────────────────
  if (sourcesError) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black px-6">
        <ServerCrash className="h-12 w-12 text-red-400" />
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
            to="/movie/$id"
            params={{ id }}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
          >
            Back to movie
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
          isFetchingProvider={sourcesPending}
          imdbId={movie?.imdbId ?? undefined}
          movieOverview={movie.overview}
          popularity={movie.popularity}
          voteAverage={movie.voteAverage}
        />
      ) : (
        /* Fetching sources loading state */
        <div className="flex h-full w-full flex-col items-center justify-center">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={movie.title}
              className="absolute inset-0 h-full w-full object-cover opacity-10"
            />
          )}
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-red-500" />
            <p className="text-lg font-bold text-white">{movie.title}</p>
            <p className="mt-1 text-sm text-white/50">
              Connecting via{" "}
              <span className="font-semibold text-red-400">{provider}</span>…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
