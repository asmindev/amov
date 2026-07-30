import { TrendingSection } from "./trending-section"
import { useContinueWatching } from "@/hooks/use-continue-watching"
import { TrendingSectionSkeleton } from "./skeletons"
import type { Movie } from "@/types/movie.types"

export function ContinueWatchingSection() {
  const { data, isLoading } = useContinueWatching()

  if (isLoading) {
    return <TrendingSectionSkeleton />
  }

  if (!data || data.length === 0) return null

  const movies: Movie[] = data.map((entry) => ({
    id: Number(entry.id),
    title: entry.title,
    posterPath: entry.posterPath,
    backdropPath: entry.backdropPath,
    overview: "",
    releaseDate: "",
    voteAverage: 0,
    voteCount: 0,
    genreIds: [],
    popularity: 0,
    adult: false,
    originalLanguage: "",
    mediaType: entry.type,
  }))

  return <TrendingSection title="Continue Watching" movies={movies} />
}
