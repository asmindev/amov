export const endpoints = {
  movies: {
    trending: "/trending/movie/week",
    topRated: "/movie/top_rated",
    popular: "/movie/popular",
    detail: (id: string) => `/movie/${id}`,
    similar: (id: string) => `/movie/${id}/recommendations`,
    videos: (id: string) => `/movie/${id}/videos`,
    discover: "/discover/movie",
  },
  tv: {
    discover: "/discover/tv",
    detail: (id: string) => `/tv/${id}`,
    similar: (id: string) => `/tv/${id}/recommendations`,
    videos: (id: string) => `/tv/${id}/videos`,
  },
  genres: {
    list: "/genre/movie/list",
    tvList: "/genre/tv/list",
  },
  search: {
    movies: "/search/movie",
    tv: "/search/tv",
    multi: "/search/multi",
  },
}
