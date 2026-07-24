import { useTrendingMovies } from "./hooks/use-trending-movies"
import { useTopRatedMovies } from "./hooks/use-top-rated-movies"
import { usePopularMovies } from "./hooks/use-popular-movies"
import { useNetflixMovies } from "./hooks/use-netflix-movies"
import { HeroBanner } from "./partials/hero-banner"
import { TrendingSection } from "./partials/trending-section"
import {
  HeroBannerSkeleton,
  TrendingSectionSkeleton,
} from "./partials/skeletons"
import { usePageMeta } from "@/hooks/use-page-meta"

export default function HomePage() {
  usePageMeta({
    title: "Home",
    description:
      "Stream movies and TV shows for free. Discover trending, top-rated, popular, and Netflix content.",
    image:
      "https://res.cloudinary.com/dph249ste/image/upload/v1784915520/ChatGPT_Image_Jul_25_2026_01_50_53_AM_iqb4vu.png",
  })
  const trending = useTrendingMovies()
  const topRated = useTopRatedMovies()
  const popular = usePopularMovies()
  const netflix = useNetflixMovies()

  const movies = trending.data?.results ?? []

  return (
    <div className="flex min-h-svh flex-col pb-16">
      {trending.isPending ? (
        <HeroBannerSkeleton />
      ) : movies.length > 0 ? (
        <HeroBanner movies={movies} />
      ) : null}

      <div className="mx-auto mt-6 w-full space-y-8 lg:w-11/12">
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

        {popular.isPending ? (
          <TrendingSectionSkeleton />
        ) : popular.data ? (
          <TrendingSection title="Popular" movies={popular.data.results} />
        ) : popular.isError ? (
          <p className="text-sm text-destructive">
            Failed to load popular movies.
          </p>
        ) : null}

        {netflix.isPending ? (
          <TrendingSectionSkeleton />
        ) : netflix.data ? (
          <TrendingSection
            title="Netflix Movies"
            movies={netflix.data.results}
          />
        ) : netflix.isError ? (
          <p className="text-sm text-destructive">
            Failed to load Netflix movies.
          </p>
        ) : null}
      </div>
    </div>
  )
}
