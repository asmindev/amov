import { useRef } from "react"
import { MovieCard } from "@/components/movie-card"
import { useMovieDetails } from "@/hooks/use-movie-details"
import type { Movie, Genre } from "@/types/movie.types"

type TrendingSectionProps = {
  title?: string
  movies: Movie[]
  genres?: Genre[]
  showRank?: boolean
  /** Map of movie id → watch progress percentage (Continue Watching). */
  progressMap?: Record<number, number>
  /** When provided, each card gets a dismiss (X) button on hover. */
  onDismiss?: (movie: Movie) => void
}

export function TrendingSection({
  title = "Trending Now",
  movies,
  genres,
  showRank = false,
  progressMap,
  onDismiss,
}: TrendingSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const movieDetails = useMovieDetails(
    movies.map((m) => ({ id: m.id, mediaType: m.mediaType }))
  )

  const scroll = (direction: "left" | "right") => {
    if (!wrapperRef.current) return
    const scrollAmount = wrapperRef.current.clientWidth * 0.7
    const delta = direction === "left" ? -scrollAmount : scrollAmount
    wrapperRef.current.scrollBy({ left: delta, behavior: "smooth" })
  }

  if (movies.length === 0) return null

  return (
    <section className="relative z-0 space-y-4 has-[.group:hover]:z-10">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
        <div className="hidden items-center gap-1 md:flex">
          <button
            onClick={() => scroll("left")}
            className="rounded border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined !text-[20px] ">chevron_left</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined !text-[20px] ">chevron_right</span>
          </button>
        </div>
      </div>
      <div
        ref={wrapperRef}
        className="scrollbar-hide -mx-4 -my-16 overflow-x-auto overflow-y-visible px-4 py-16 md:overflow-x-hidden"
      >
        <div className="flex w-max gap-3">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={index + 1}
              showRank={showRank}
              genres={genres}
              logoPath={movieDetails[index]?.logoPath}
              expandOnHover
              progress={progressMap?.[movie.id]}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
