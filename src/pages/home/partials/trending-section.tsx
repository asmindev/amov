import { Link } from "@tanstack/react-router"
import { getImageUrl } from "@/helpers/image-url"
import { formatRating } from "@/helpers/format-rating"
import { formatYear } from "@/helpers/format-date"
import type { Movie } from "@/types/movie.types"

type TrendingSectionProps = {
  movies: Movie[]
}

export function TrendingSection({ movies }: TrendingSectionProps) {
  if (movies.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">Trending Now</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to="/movie/$id"
            params={{ id: String(movie.id) }}
            className="group w-[180px] flex-shrink-0 space-y-2"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
              <img
                src={getImageUrl(movie.posterPath, "w342")}
                alt={movie.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                {formatRating(movie.voteAverage)}
              </span>
            </div>
            <div>
              <h3 className="line-clamp-1 text-sm font-medium">{movie.title}</h3>
              <p className="text-xs text-muted-foreground">
                {formatYear(movie.releaseDate)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
