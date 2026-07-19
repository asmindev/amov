export const queryKeys = {
  movies: {
    all: ["movies"] as const,
    trending: () => [...queryKeys.movies.all, "trending"] as const,
    topRated: () => [...queryKeys.movies.all, "topRated"] as const,
    netflix: () => [...queryKeys.movies.all, "netflix"] as const,
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
  },
}
