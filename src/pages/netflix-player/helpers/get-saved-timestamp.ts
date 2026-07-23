export function getSavedTimestamp(movieId: number): number {
  try {
    const raw = localStorage.getItem("amov_watch_progress")
    if (!raw) return 0
    const all = JSON.parse(raw) as Record<string, { timestamp: number }>
    return all[`movie_${movieId}`]?.timestamp ?? 0
  } catch {
    return 0
  }
}
