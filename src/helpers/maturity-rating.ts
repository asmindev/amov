export function getMaturityRating(
  genres: { name: string }[] = [],
  voteAverage = 0
): string {
  const genreNames = genres.map((g) => g.name.toLowerCase())
  if (
    genreNames.includes("horror") ||
    genreNames.includes("thriller") ||
    genreNames.includes("crime")
  ) {
    return "18+"
  }
  if (
    genreNames.includes("action") ||
    genreNames.includes("adventure") ||
    genreNames.includes("science fiction") ||
    voteAverage > 7.5
  ) {
    return "13+"
  }
  return "PG"
}
