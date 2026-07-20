export const queryKeys = {
  movies: {
    all: ["movies"] as const,
    trending: () => [...queryKeys.movies.all, "trending"] as const,
    topRated: () => [...queryKeys.movies.all, "topRated"] as const,
    popular: () => [...queryKeys.movies.all, "popular"] as const,
    netflix: () => [...queryKeys.movies.all, "netflix"] as const,
    discover: () => [...queryKeys.movies.all, "discover"] as const,
    discoverInfinite: () => [...queryKeys.movies.all, "discover-infinite"] as const,
    detail: (id: string) => [...queryKeys.movies.all, "detail", id] as const,
    similar: (id: string) => [...queryKeys.movies.all, "similar", id] as const,
    videos: (id: string) => [...queryKeys.movies.all, "videos", id] as const,
    byGenre: (genreId: string) =>
      [...queryKeys.movies.all, "genre", genreId] as const,
  },
  genres: {
    all: ["genres"] as const,
  },
  search: {
    query: (q: string) => ["search", q] as const,
    infinite: (q: string) => ["search-infinite", q] as const,
  },
}
