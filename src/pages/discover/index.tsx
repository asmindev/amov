import { useNavigate, useSearch } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { Search as SearchIcon } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { useDiscover } from "./hooks/use-discover"

export default function DiscoverPage() {
  const { query = "" } = useSearch({ from: "/discover" })
  const navigate = useNavigate({ from: "/discover" })
  const [localQuery, setLocalQuery] = useState(query)
  
  const { data, isPending, isError } = useDiscover(query)

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        navigate({ search: { query: localQuery || undefined } })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [localQuery, navigate, query])

  const movies = data?.results ?? []

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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} className="w-full" />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-muted-foreground">No movies found.</p>
        )}
      </div>
    </div>
  )
}
