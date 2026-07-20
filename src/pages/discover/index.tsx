import { useNavigate, useSearch } from "@tanstack/react-router"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search as SearchIcon } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { useDiscover } from "./hooks/use-discover"
import { useGenres } from "@/hooks/use-genres"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Filter, ChevronDown } from "lucide-react"

const PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 384, name: "HBO Max" },
  { id: 15, name: "Hulu" },
  { id: 2, name: "Apple TV" },
]

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "ID", name: "Indonesia" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
]

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest Releases" },
  { value: "primary_release_date.asc", label: "Oldest Releases" },
  { value: "revenue.desc", label: "Highest Grossing" },
]

const YEARS = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))

export default function DiscoverPage() {
  const { 
    query = "", 
    genres: selectedGenres = [], 
    year: selectedYear = "", 
    providers: selectedProviders = [], 
    country: selectedCountry = "",
    sortBy: selectedSortBy = "popularity.desc"
  } = useSearch({ from: "/discover" })
  const navigate = useNavigate({ from: "/discover" })
  const [localQuery, setLocalQuery] = useState(query)

  const { data: genresData } = useGenres()
  const genres = genresData?.genres ?? []

  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useDiscover(query, {
    genres: selectedGenres,
    year: selectedYear,
    providers: selectedProviders,
    country: selectedCountry,
    sortBy: selectedSortBy,
  })

  const updateFilters = (newFilters: { genres?: number[], year?: string, providers?: number[], country?: string, sortBy?: string }) => {
    navigate({
      search: (prev) => {
        const updated: Record<string, any> = { ...prev, ...newFilters }

        if (updated.genres && updated.genres.length === 0) updated.genres = undefined
        if (updated.providers && updated.providers.length === 0) updated.providers = undefined
        if (updated.year === "") updated.year = undefined
        if (updated.country === "") updated.country = undefined
        if (updated.sortBy === "popularity.desc" || updated.sortBy === "") updated.sortBy = undefined
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
        <div className="mb-10 flex flex-wrap items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10">
                  <Filter className="h-4 w-4" />
                  Genres
                  {selectedGenres.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      {selectedGenres.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Select Genres</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                  {genres.map((genre) => (
                    <DropdownMenuCheckboxItem
                      key={genre.id}
                      checked={selectedGenres.includes(genre.id)}
                      onCheckedChange={(checked) => {
                        const newGenres = checked
                          ? [...selectedGenres, genre.id]
                          : selectedGenres.filter((id) => id !== genre.id)
                        updateFilters({ genres: newGenres })
                      }}
                    >
                      {genre.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={selectedYear} onValueChange={(val: string | null) => updateFilters({ year: val === "all" || !val ? "" : val })}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 hover:bg-white/10">
              <SelectValue placeholder="Release Year">
                {selectedYear === "all" || !selectedYear ? "All Years" : selectedYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectGroup>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedCountry} onValueChange={(val: string | null) => updateFilters({ country: val === "all" || !val ? "" : val })}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 hover:bg-white/10">
              <SelectValue placeholder="Country">
                {selectedCountry === "all" || !selectedCountry 
                  ? "All Countries" 
                  : COUNTRIES.find((c) => c.code === selectedCountry)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectGroup>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={selectedSortBy} onValueChange={(val: string | null) => updateFilters({ sortBy: val || "popularity.desc" })}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/10 hover:bg-white/10">
              <SelectValue placeholder="Sort By">
                {SORT_OPTIONS.find((opt) => opt.value === selectedSortBy)?.label || "Most Popular"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectGroup>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10">
                  Providers
                  {selectedProviders.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      {selectedProviders.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Streaming Providers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                  {PROVIDERS.map((provider) => (
                    <DropdownMenuCheckboxItem
                      key={provider.id}
                      checked={selectedProviders.includes(provider.id)}
                      onCheckedChange={(checked) => {
                        const newProviders = checked
                          ? [...selectedProviders, provider.id]
                          : selectedProviders.filter((id) => id !== provider.id)
                        updateFilters({ providers: newProviders })
                      }}
                    >
                      {provider.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {(selectedGenres.length > 0 || selectedYear || selectedProviders.length > 0 || selectedCountry || selectedSortBy !== "popularity.desc") && (
            <Button
              variant="ghost"
              onClick={() => {
                updateFilters({ genres: [], year: "", providers: [], country: "", sortBy: "popularity.desc" })
              }}
              className="text-muted-foreground hover:text-white"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-semibold">
          {query ? `Search results for "${query}"` : "Discover Movies"}
        </h2>

        {isPending ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4 mt-2 lg:mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`next-page-skeleton-${i}`} className="flex flex-col gap-2">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
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
