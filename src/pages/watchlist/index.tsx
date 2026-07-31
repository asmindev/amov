import { Link } from "@tanstack/react-router"
import { MovieCard } from "@/components/movie-card"
import { useWatchlistItems } from "@/hooks/use-watchlist"

export default function WatchlistPage() {
  const { items, isLoading, isEmpty } = useWatchlistItems()

  return (
    <div className="mx-auto max-w-7xl p-6 pt-24">
      <h1 className="font-heading text-2xl font-semibold">Watchlist</h1>
      <p className="mt-2 text-muted-foreground">
        Movies and TV shows you've saved
      </p>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-lg bg-white/5"
            />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="mt-24 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-white">Your watchlist is empty</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Save movies and TV shows you want to watch later — they'll show up
            here.
          </p>
          <Link
            to="/"
            className="mt-2 rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-80"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}
