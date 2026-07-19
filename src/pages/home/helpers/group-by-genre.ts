import type { Movie } from "@/types/movie.types"

export function groupByGenre(
  movies: Movie[],
  genreMap: Map<number, string>
): Map<string, Movie[]> {
  const grouped = new Map<string, Movie[]>()

  movies.forEach((movie) => {
    movie.genreIds.forEach((genreId) => {
      const genreName = genreMap.get(genreId)
      if (genreName) {
        const existing = grouped.get(genreName) || []
        grouped.set(genreName, [...existing, movie])
      }
    })
  })

  return grouped
}
