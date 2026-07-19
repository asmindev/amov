import { useTrendingMovies } from "./hooks/use-trending-movies"
import { useGenres } from "./hooks/use-genres"
import { HeroBanner } from "./partials/hero-banner"
import { TrendingSection } from "./partials/trending-section"
import { GenreList } from "./partials/genre-list"
import {
  HeroBannerSkeleton,
  TrendingSectionSkeleton,
  GenreListSkeleton,
} from "./partials/skeletons"

export default function HomePage() {
  const trending = useTrendingMovies()
  const genres = useGenres()

  const movies = trending.data?.results ?? []

  return (
    <div className="flex min-h-svh flex-col gap-12">
      {trending.isPending ? (
        <HeroBannerSkeleton />
      ) : movies.length > 0 ? (
        <HeroBanner movies={movies} />
      ) : null}

      <div className="w-full lg:w-11/12 mx-auto">


      {trending.isPending ? (
        <TrendingSectionSkeleton />
      ) : trending.data ? (
        <TrendingSection movies={trending.data.results} />
      ) : trending.isError ? (
        <p className="text-sm text-destructive">
          Failed to load trending movies.
        </p>
      ) : null}

      {genres.isPending ? (
        <GenreListSkeleton />
      ) : genres.data ? (
        <GenreList genres={genres.data.genres} />
      ) : genres.isError ? (
        <p className="text-sm text-destructive">Failed to load genres.</p>
      ) : null}
      </div>

    </div>
  )
}
