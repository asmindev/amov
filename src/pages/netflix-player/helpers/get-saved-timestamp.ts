export function getSavedTimestamp(
  mediaType: "movie" | "tv",
  movieId: number
): number {
  try {
    const raw = localStorage.getItem("amov_watch_progress")
    if (!raw) return 0
    const all = JSON.parse(raw) as Record<string, { timestamp: number }>
    // Prefer mediaType-prefixed key, fall back to legacy movie_ for backward compat
    return (
      all[`${mediaType}_${movieId}`]?.timestamp ??
      all[`movie_${movieId}`]?.timestamp ??
      0
    )
  } catch {
    return 0
  }
}
