import { useTrendingMovies } from "./hooks/use-trending-movies"
import { useTopRatedMovies } from "./hooks/use-top-rated-movies"
import { HeroBanner } from "./partials/hero-banner"
import { TrendingSection } from "./partials/trending-section"
import {
  HeroBannerSkeleton,
  TrendingSectionSkeleton,
} from "./partials/skeletons"

export default function HomePage() {
  const trending = useTrendingMovies()
  const topRated = useTopRatedMovies()

  const movies = trending.data?.results ?? []

  return (
    <div className="flex min-h-svh flex-col gap-12">
      {trending.isPending ? (
        <HeroBannerSkeleton />
      ) : movies.length > 0 ? (
        <HeroBanner movies={movies} />
      ) : null}

      <div className="w-full lg:w-11/12 mx-auto space-y-12">
      {trending.isPending ? (
        <TrendingSectionSkeleton />
      ) : trending.data ? (
        <TrendingSection movies={trending.data.results} showRank />
      ) : trending.isError ? (
        <p className="text-sm text-destructive">
          Failed to load trending movies.
        </p>
      ) : null}

      {topRated.isPending ? (
        <TrendingSectionSkeleton />
      ) : topRated.data ? (
        <TrendingSection title="Top Rated" movies={topRated.data.results} />
      ) : topRated.isError ? (
        <p className="text-sm text-destructive">
          Failed to load top rated movies.
        </p>
      ) : null}

      </div>

    </div>
  )
}
