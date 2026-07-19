import { Link } from "@tanstack/react-router"
import { Play, ThumbsUp, ChevronDown } from "lucide-react"
import { getImageUrl } from "@/helpers/image-url"
import { formatYear } from "@/helpers/format-date"
import type { Movie, Genre } from "@/types/movie.types"

type MovieCardProps = {
  movie: Movie
  rank: number
  genres?: Genre[]
}

export function MovieCard({ movie, rank, genres }: MovieCardProps) {
  const genreName = (() => {
    if (!genres) return ""
    const id = movie.genreIds[0]
    if (!id) return ""
    return genres.find((g) => g.id === id)?.name ?? ""
  })()

  return (
    <div className="group relative z-0 transition-none hover:z-50">
      <div className="relative w-[260px] origin-bottom transition-transform duration-300 ease-in-out group-hover:scale-[1.3] group-hover:-translate-y-3 lg:w-[280px]">
        <div className="absolute -bottom-2 -left-8 z-10">
          <h1 className="text-7xl font-black text-transparent transition-all duration-200 group-hover:text-foreground lg:text-8xl [-webkit-text-stroke:2px_gray]">
            {rank}
          </h1>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-sm group-hover:rounded-b-none">
          <Link
            to="/movie/$id"
            params={{ id: String(movie.id) }}
          >
            <img
              src={getImageUrl(movie.posterPath ?? movie.backdropPath, "w780")}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-1 right-1 z-10 rounded-md bg-black/50 px-1.5 py-1 text-xs font-medium text-white backdrop-blur-md transition duration-300 group-hover:scale-85 origin-top-right">
              {formatYear(movie.releaseDate)}
            </span>
          </Link>
        </div>
        <div className="pointer-events-none invisible absolute left-0 right-0 top-full z-20 rounded-b-md bg-zinc-900 px-3 py-3 opacity-0 shadow-2xl shadow-black/70 transition-all duration-200 delay-75 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                to="/movie/$id"
                params={{ id: String(movie.id) }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
              >
                <Play className="h-4 w-4 fill-black" />
              </Link>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition hover:border-white">
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
            </div>
            <Link
              to="/movie/$id"
              params={{ id: String(movie.id) }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition hover:border-white"
            >
              <ChevronDown className="h-4 w-4" />
            </Link>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-semibold text-green-400">
              {Math.round(movie.voteAverage * 10)}% Match
            </span>
            <span className="rounded border border-white/30 px-1 text-[9px]">HD</span>
            <span className="text-yellow-400">
              {movie.voteAverage.toFixed(1)}
            </span>
          </div>
          {genreName && (
            <p className="mb-2 text-[11px] leading-relaxed text-white/70 line-clamp-1">
              {genreName}
            </p>
          )}
          {movie.overview && (
            <p className="mb-2 text-[11px] leading-relaxed text-white/60 line-clamp-2">
              {movie.overview}
            </p>
          )}
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span>{formatYear(movie.releaseDate)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
