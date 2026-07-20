import { useNavigate, useSearch } from "@tanstack/react-router"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search as SearchIcon } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { useDiscover } from "./hooks/use-discover"
import { useGenres } from "@/hooks/use-genres"

const PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 384, name: "HBO Max" },
  { id: 15, name: "Hulu" },
  { id: 2, name: "Apple TV" },
]

const YEARS = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))

export default function DiscoverPage() {
  const { query = "" } = useSearch({ from: "/discover" })
  const navigate = useNavigate({ from: "/discover" })
  const [localQuery, setLocalQuery] = useState(query)
  
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedProviders, setSelectedProviders] = useState<number[]>([])

  const { data: genresData } = useGenres()
  const genres = genresData?.genres ?? []

  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useDiscover(query, {
    genres: selectedGenres,
    year: selectedYear,
    providers: selectedProviders,
  })

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
        <div className="mb-10 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Genres</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {genres.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id)
                return (
                  <button
                    key={genre.id}
                    onClick={() =>
                      setSelectedGenres((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== genre.id)
                          : [...prev, genre.id]
                      )
                    }
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                      isSelected
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {genre.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Release Year</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {YEARS.map((year) => {
                const isSelected = selectedYear === year
                return (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(isSelected ? "" : year)}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                      isSelected
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Streaming Providers</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {PROVIDERS.map((provider) => {
                const isSelected = selectedProviders.includes(provider.id)
                return (
                  <button
                    key={provider.id}
                    onClick={() =>
                      setSelectedProviders((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== provider.id)
                          : [...prev, provider.id]
                      )
                    }
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                      isSelected
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {provider.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-semibold">
          {query ? `Search results for "${query}"` : "Discover Movies"}
        </h2>

        {isPending ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          </div>
        ) : isError ? (
          <p className="text-center text-destructive">Failed to load movies.</p>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
              {movies.map((movie, index) => {
                if (index === movies.length - 1) {
                  return (
                    <div ref={lastElementRef} key={`${movie.id}-${index}`}>
                      <MovieCard movie={movie} className="w-full" />
                    </div>
                  )
                }
                return (
                  <div key={`${movie.id}-${index}`}>
                    <MovieCard movie={movie} className="w-full" />
                  </div>
                )
              })}
            </div>
            {isFetchingNextPage && (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
              </div>
            )}
          </>
        ) : (
          <p className="py-20 text-center text-muted-foreground">No movies found.</p>
        )}
      </div>
    </div>
  )
}
