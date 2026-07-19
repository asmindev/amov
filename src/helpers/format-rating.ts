export function formatRating(rating?: number | null): string {
  return (rating ?? 0).toFixed(1)
}

export function formatRatingWithStars(rating?: number | null): {
  full: number
  half: boolean
  empty: number
} {
  const scaled = (rating ?? 0) / 2
  const full = Math.floor(scaled)
  const half = scaled - full >= 0.25
  const empty = 5 - full - (half ? 1 : 0)
  return { full, half, empty }
}
