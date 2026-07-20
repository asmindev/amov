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
  validateSearch: (search: Record<string, unknown>): { query?: string } => {
    return {
      query: search.query as string | undefined,
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
