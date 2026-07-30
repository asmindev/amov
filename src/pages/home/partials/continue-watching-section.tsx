import { TrendingSection } from "./trending-section"
import { useContinueWatching } from "@/hooks/use-continue-watching"
import { TrendingSectionSkeleton } from "./skeletons"

export function ContinueWatchingSection() {
  const { data, isLoading } = useContinueWatching()

  if (isLoading) {
    return <TrendingSectionSkeleton />
  }

  if (!data || data.length === 0) return null

  // ponytail: anime excluded because Movie.mediaType only accepts "movie" | "tv"
  // — revisit when anime type is added to TrendingSection's Movie type
  const movies = data
    .filter((e) => e.type !== "anime")
    .map((entry) => ({
      id: Number(entry.id),
      title: entry.title ?? "Unknown",
      posterPath: entry.posterPath ?? null,
      backdropPath: entry.backdropPath ?? null,
      overview: "",
      releaseDate: "",
      voteAverage: 0,
      voteCount: 0,
      genreIds: [] as number[],
      popularity: 0,
      adult: false,
      originalLanguage: "",
      mediaType: entry.type === "tv" ? "tv" : "movie",
    }))

  return <TrendingSection title="Continue Watching" movies={movies} />
}
