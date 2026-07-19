import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import type { Movie, Genre } from "@/types/movie.types"

type TrendingSectionProps = {
  title?: string
  movies: Movie[]
  genres?: Genre[]
  showRank?: boolean
}

export function TrendingSection({ title = "Trending Now", movies, genres, showRank = false }: TrendingSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)

  if (movies.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current || !wrapperRef.current) return
    const cardWidth = 280 + 50
    const maxOffset = Math.max(0, trackRef.current.scrollWidth - wrapperRef.current.clientWidth)

    if (direction === "left") {
      offsetRef.current = Math.max(0, offsetRef.current - cardWidth)
    } else {
      offsetRef.current = Math.min(maxOffset, offsetRef.current + cardWidth)
    }

    trackRef.current.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`
  }

  return (
    <section className="relative z-0 has-[.group:hover]:z-10 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={wrapperRef}>
        <div
          ref={trackRef}
          className="flex gap-[50px] will-change-transform"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={index + 1}
              showRank={showRank}
              genres={genres}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
