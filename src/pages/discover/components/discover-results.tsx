import { MovieCard } from "@/components/movie-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMovieDetails } from "@/hooks/use-movie-details"
import type { Movie, Genre } from "@/types/movie.types"

type DiscoverResultsProps = {
  query: string
  isPending: boolean
  isError: boolean
  movies: Movie[]
  genres?: Genre[]
  isFetchingNextPage: boolean
  lastElementRef: (node: HTMLDivElement | null) => void
}

export function DiscoverResults({
  query,
  isPending,
  isError,
  movies,
  genres,
  isFetchingNextPage,
  lastElementRef,
}: DiscoverResultsProps) {
  const movieDetails = useMovieDetails(
    movies.map((m) => ({ id: m.id, mediaType: m.mediaType }))
  )
  isError && console.error("Failed to load movies:", isError)

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-semibold">
        {query ? `Search results for "${query}"` : "Discover Movies"}
      </h2>

      {isPending ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-destructive">Failed to load movies.</p>
      ) : movies.length > 0 ? (
        <>
          <div className="isolate grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
            {movies.map((movie, index) => (
              <div
                ref={index === movies.length - 1 ? lastElementRef : undefined}
                key={`${movie.id}-${index}`}
              >
                <MovieCard
                  movie={movie}
                  genres={genres}
                  logoPath={movieDetails[index]?.logoPath}
                />
              </div>
            ))}
          </div>
          {isFetchingNextPage && (
            <div className="isolate mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:mt-4 lg:gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`next-page-skeleton-${i}`}
                  className="relative z-0 flex flex-col gap-2"
                >
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="py-20 text-center text-muted-foreground">
          No movies found.
        </p>
      )}
    </div>
  )
}
