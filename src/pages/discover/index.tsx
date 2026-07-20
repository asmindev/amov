import { useNavigate, useSearch } from "@tanstack/react-router"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search as SearchIcon } from "lucide-react"
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

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        navigate({ search: { query: localQuery || undefined } })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localQuery, navigate, query])

  const movies = data?.pages?.flatMap((page) => page.results) ?? []

  return (
    <div className="mx-auto min-h-svh max-w-[1400px] px-6 pb-20 pt-28">
      <div className="mb-12">
        <div className="relative mx-auto max-w-xl">
          <SearchIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for movies..."
            className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-14 pr-6 text-white outline-none transition-colors focus:border-white/30 focus:bg-white/10"
          />
        </div>
      </div>

      {!query && (
        <DiscoverFilters
          genres={genres}
          selectedGenres={selectedGenres}
          selectedYear={selectedYear}
          selectedProviders={selectedProviders}
          selectedCountry={selectedCountry}
          selectedSortBy={selectedSortBy}
          updateFilters={updateFilters}
        />
      )}

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
