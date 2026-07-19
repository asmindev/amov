export const endpoints = {
  movies: {
    trending: "/trending/movie/week",
    topRated: "/movie/top_rated",
    detail: (id: string) => `/movie/${id}`,
    similar: (id: string) => `/movie/${id}/similar`,
    videos: (id: string) => `/movie/${id}/videos`,
    discover: "/discover/movie",
  },
  genres: {
    list: "/genre/movie/list",
  },
  search: {
    movies: "/search/movie",
  },
}
