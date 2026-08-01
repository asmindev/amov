import { useParams } from "@tanstack/react-router"
import { useMediaDetail, useSimilarMedia } from "./hooks/use-movie-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { getWatchProgress } from "@/hooks/use-watch-progress"
import { usePageMeta } from "@/hooks/use-page-meta"
import { getImageUrl } from "@/helpers/image-url"

// Import modular partial components
import { MovieBillboard } from "./partials/movie-billboard"
import { MovieHero } from "./partials/movie-hero"
import { DetailsSection } from "./partials/details-section"
import { CastSection } from "./partials/cast-section"
import { EpisodesSection } from "./partials/episodes-section"
import { SimilarSection } from "./partials/similar-section"

export default function MovieDetailPage() {
  const params = useParams({ strict: false }) as { type?: string; id?: string }
  const mediaType: "movie" | "tv" = params.type === "tv" ? "tv" : "movie"
  const id = params.id || ""

  const { data: movie, isPending, isError } = useMediaDetail(mediaType, id)
  const { data: similar } = useSimilarMedia(mediaType, id)

  usePageMeta({
    title: movie?.title || "Loading...",
    description: movie?.overview || undefined,
    image: movie?.backdropPath
      ? getImageUrl(movie.backdropPath, "w780")
      : movie?.posterPath
        ? getImageUrl(movie.posterPath, "w500")
        : undefined,
  })

  if (isPending) {
    return (
      <div className="min-h-svh bg-background">
        <Skeleton className="h-[100vh] w-full rounded-none" />
        <div className="absolute bottom-20 left-10 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
    )
  }

  if (isError || !movie) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-destructive">Failed to load media details.</p>
      </div>
    )
  }

  const similarMovies = similar?.results.slice(0, 12) ?? []
  const cast = movie.cast?.slice(0, 18) ?? []
  const savedProgress = getWatchProgress(mediaType, movie.id)

  return (
    <div className="relative min-h-svh overflow-hidden bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Background Media (Image / Video) */}
      <MovieBillboard movie={movie} />

      {/* Foreground Content */}
      <div className="relative z-10 flex min-h-svh flex-col justify-end">
        {/* Hero Info */}
        <MovieHero movie={movie} savedProgress={savedProgress} />

        {/* Content Details Below Fold */}
        <div className="w-full bg-linear-to-b from-transparent to-background pt-8 pb-32">
          <div className="mx-auto max-w-[1400px] space-y-20 px-6 md:px-16">
            {/* Overview & Info Section */}
            <DetailsSection movie={movie} />

            {/* TV Show Episodes Section */}
            {mediaType === "tv" && (
              <EpisodesSection tvId={id} seasons={movie.seasons} />
            )}

            {/* Cast Section */}
            <CastSection cast={cast} />

            {/* Similar Movies Section */}
            <SimilarSection similarMovies={similarMovies} />
          </div>
        </div>
      </div>
    </div>
  )
}
