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
  } => {
    const parseNumberArray = (val: unknown): number[] | undefined => {
      if (!val) return undefined
      if (Array.isArray(val)) return val.map(Number).filter((n) => !isNaN(n))
      if (typeof val === "string")
        return val.split(",").map(Number).filter((n) => !isNaN(n))
      return undefined
    }

    return {
      query: search.query as string | undefined,
      genres: parseNumberArray(search.genres),
      providers: parseNumberArray(search.providers),
      year: search.year as string | undefined,
      country: search.country as string | undefined,
      sortBy: search.sortBy as string | undefined,
    }
  },
  component: () => (
    <React.Suspense>
      <LazyDiscover />
    </React.Suspense>
  ),
})

const movieDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/movie/$id",
  validateSearch: (search: Record<string, unknown>): { play?: boolean } => {
    return {
      play: search.play === "true" || search.play === true,
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  discoverRoute,
  movieDetailRoute,
  watchlistRoute,
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
