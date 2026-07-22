import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { useMovieDetails } from "@/hooks/use-movie-details"
import type { Movie, Genre } from "@/types/movie.types"

type TrendingSectionProps = {
  title?: string
  movies: Movie[]
  genres?: Genre[]
  showRank?: boolean
}

export function TrendingSection({
  title = "Trending Now",
  movies,
  genres,
  showRank = false,
}: TrendingSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)

  const movieDetails = useMovieDetails(movies.map((m) => m.id))

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current || !wrapperRef.current) return
    const scrollAmount = wrapperRef.current.clientWidth * 0.7
    const maxOffset = Math.max(
      0,
      trackRef.current.scrollWidth - wrapperRef.current.clientWidth
    )

    if (direction === "left") {
      offsetRef.current = Math.max(0, offsetRef.current - scrollAmount)
    } else {
      offsetRef.current = Math.min(maxOffset, offsetRef.current + scrollAmount)
    }

    trackRef.current.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`
  }

  if (movies.length === 0) return null

  return (
    <section className="relative z-0 space-y-4 has-[.group:hover]:z-10">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="rounded border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={wrapperRef} className="-mx-4 -my-16 overflow-hidden px-4 py-16">
        <div
          ref={trackRef}
          className="flex gap-3 transition-transform duration-500 ease-out will-change-transform"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={index + 1}
              showRank={showRank}
              genres={genres}
              logoPath={movieDetails[index]?.logoPath}
              expandOnHover
            />
          ))}
        </div>
      </div>
    </section>
  )
}
