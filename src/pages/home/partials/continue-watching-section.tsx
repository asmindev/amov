import { useState } from "react"
import { TrendingSection } from "./trending-section"
import { useContinueWatching } from "@/hooks/use-continue-watching"
import { dismissWatchProgress } from "@/hooks/use-watch-progress"
import { TrendingSectionSkeleton } from "./skeletons"
import type { Movie } from "@/types/movie.types"

export function ContinueWatchingSection() {
  const { data, isLoading } = useContinueWatching()
  // Dismiss mutates localStorage; this tick re-renders so the row updates
  // without waiting for a React Query refetch.
  const [dismissTick, setDismissTick] = useState(0)
  void dismissTick

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

  const progressMap: Record<number, number> = {}
  for (const entry of data) {
    progressMap[Number(entry.id)] = entry.progress
  }

  return (
    <TrendingSection
      title="Continue Watching"
      movies={movies}
      progressMap={progressMap}
      onDismiss={(movie) => {
        dismissWatchProgress(movie.mediaType || "movie", movie.id)
        setDismissTick((t) => t + 1)
      }}
    />
  )
}
