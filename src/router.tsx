import React from "react"
import {
  createRoute,
  createRouter,
  createRootRoute,
} from "@tanstack/react-router"
import AppLayout from "@/components/layout/app-layout"

const rootRoute = createRootRoute({
  component: AppLayout,
})

const LazyHome = React.lazy(() => import("@/pages/home/index.tsx"))
const LazyDiscover = React.lazy(() => import("@/pages/discover/index.tsx"))
const LazyMovieDetail = React.lazy(
  () => import("@/pages/movie-detail/index.tsx")
)
const LazyWatchlist = React.lazy(() => import("@/pages/watchlist/index.tsx"))
const LazyNetflixPlayer = React.lazy(
  () => import("@/pages/netflix-player/index.tsx")
)

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <React.Suspense>
      <LazyHome />
    </React.Suspense>
  ),
})

const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discover",
  validateSearch: (
    search: Record<string, unknown>
  ): {
    query?: string
    genres?: number[]
    year?: string
    providers?: number[]
    country?: string
    sortBy?: string
    type?: "all" | "movie" | "tv"
  } => {
    const parseNumberArray = (val: unknown): number[] | undefined => {
      if (!val) return undefined
      if (Array.isArray(val)) return val.map(Number).filter((n) => !isNaN(n))
      if (typeof val === "string")
        return val
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      return undefined
    }

    return {
      query: search.query as string | undefined,
      genres: parseNumberArray(search.genres),
      providers: parseNumberArray(search.providers),
      year: search.year as string | undefined,
      country: search.country as string | undefined,
      sortBy: search.sortBy as string | undefined,
      type: search.type as "all" | "movie" | "tv" | undefined,
    }
  },
  component: () => (
    <React.Suspense>
      <LazyDiscover />
    </React.Suspense>
  ),
})

const mediaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$type/$id",
  parseParams: (params) => ({
    type: params.type === "tv" ? ("tv" as const) : ("movie" as const),
    id: params.id,
  }),
  validateSearch: (
    search: Record<string, unknown>
  ): { play?: boolean; season?: number; episode?: number } => {
    return {
      play: search.play === "true" || search.play === true,
      season: search.season ? Number(search.season) : undefined,
      episode: search.episode ? Number(search.episode) : undefined,
    }
  },
  component: () => (
    <React.Suspense>
      <LazyMovieDetail />
    </React.Suspense>
  ),
})

const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/watchlist",
  component: () => (
    <React.Suspense>
      <LazyWatchlist />
    </React.Suspense>
  ),
})

const netflixPlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$type/$id/netflix",
  parseParams: (params) => ({
    type: params.type === "tv" ? ("tv" as const) : ("movie" as const),
    id: params.id,
  }),
  validateSearch: (
    search: Record<string, unknown>
  ): { season?: number; episode?: number; room?: string } => {
    return {
      season: search.season ? Number(search.season) : undefined,
      episode: search.episode ? Number(search.episode) : undefined,
      room: typeof search.room === "string" ? search.room : undefined,
    }
  },
  component: () => (
    <React.Suspense>
      <LazyNetflixPlayer />
    </React.Suspense>
  ),
})

const legacyNetflixPlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/movie/$id/netflix",
  component: () => (
    <React.Suspense>
      <LazyNetflixPlayer />
    </React.Suspense>
  ),
})

const LazyAdmin = React.lazy(() => import("@/pages/admin/index.tsx"))

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <React.Suspense>
      <LazyAdmin />
    </React.Suspense>
  ),
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  discoverRoute,
  mediaDetailRoute,
  watchlistRoute,
  netflixPlayerRoute,
  legacyNetflixPlayerRoute,
  adminRoute,
])

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
