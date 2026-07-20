import { useNavigate, useSearch } from "@tanstack/react-router"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search as SearchIcon, X } from "lucide-react"
import { motion } from "motion/react"
import { useDiscover } from "./hooks/use-discover"
import { useGenres } from "@/hooks/use-genres"
import { DiscoverFilters } from "./components/discover-filters"
import { DiscoverResults } from "./components/discover-results"

export default function DiscoverPage() {
  const {
    query = "",
    genres: selectedGenres = [],
    year: selectedYear = "",
    providers: selectedProviders = [],
    country: selectedCountry = "",
    sortBy: selectedSortBy = "popularity.desc",
  } = useSearch({ from: "/discover" })
  const navigate = useNavigate({ from: "/discover" })
  const [localQuery, setLocalQuery] = useState(query)

  const { data: genresData } = useGenres()
  const genres = genresData?.genres ?? []

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscover(query, {
    genres: selectedGenres,
    year: selectedYear,
    providers: selectedProviders,
    country: selectedCountry,
    sortBy: selectedSortBy,
  })

  const updateFilters = (newFilters: {
    genres?: number[]
    year?: string
    providers?: number[]
    country?: string
    sortBy?: string
  }) => {
    navigate({
      search: (prev) => {
        const updated: {
          genres?: number[]
          year?: string
          providers?: number[]
          country?: string
          sortBy?: string
          query?: string
        } = { ...(prev as object), ...newFilters }

        if (updated.genres && updated.genres.length === 0)
          updated.genres = undefined
        if (updated.providers && updated.providers.length === 0)
          updated.providers = undefined
        if (updated.year === "") updated.year = undefined
        if (updated.country === "") updated.country = undefined
        if (updated.sortBy === "popularity.desc" || updated.sortBy === "")
          updated.sortBy = undefined
        if (updated.query === "") updated.query = undefined

        return updated
      },
    })
  }

  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage || isPending) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [isFetchingNextPage, isPending, hasNextPage, fetchNextPage]
  )

  // Debounce the search input — merge with existing params to avoid wiping filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        navigate({
          search: (prev) => ({
            ...prev,
            query: localQuery || undefined,
          }),
        })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localQuery, navigate, query])

  const movies = data?.pages?.flatMap((page) => page.results) ?? []

  return (
    <div className="mx-auto min-h-svh max-w-[1400px] px-6 pb-20 pt-24">
      {/* Search hero section */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Find your next watch
        </p>
        <div className="relative mx-auto max-w-2xl">
          <SearchIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for movies, directors, genres..."
            className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-14 pr-12 text-base text-white outline-none ring-0 backdrop-blur-sm transition-all duration-200 placeholder:text-white/30 focus:border-white/20 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
          />
          {localQuery && (
            <button
              onClick={() => setLocalQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters — always visible, not gated on query */}
      <DiscoverFilters
        genres={genres}
        selectedGenres={selectedGenres}
        selectedYear={selectedYear}
        selectedProviders={selectedProviders}
        selectedCountry={selectedCountry}
        selectedSortBy={selectedSortBy}
        updateFilters={updateFilters}
      />

      <DiscoverResults
        query={query}
        isPending={isPending}
        isError={isError}
        movies={movies}
        isFetchingNextPage={isFetchingNextPage}
        lastElementRef={lastElementRef}
      />
    </div>
  )
}
