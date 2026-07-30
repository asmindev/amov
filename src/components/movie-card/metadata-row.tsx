import { getMovieQuality } from "@/helpers/movie-quality"
import { formatYear } from "@/helpers/format-date"
import type { Movie } from "@/types/movie.types"

export function MetadataRow({ movie }: { movie: Movie }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 px-3 pb-1 text-[11px] font-semibold text-gray-400">
      <span className="font-bold text-green-500">
        {Math.round(movie.voteAverage * 10)}% Match
      </span>
      <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
        {getMovieQuality(movie.popularity, movie.releaseDate)}
      </span>
      <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
        {movie.mediaType === "tv" ? "TV" : "Movie"}
      </span>
      <span>{formatYear(movie.releaseDate)}</span>
    </div>
  )
}

export function PopupMetadataRow({ movie }: { movie: Movie }) {
  return (
    <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-400">
      <span className="font-bold text-green-500">
        {Math.round(movie.voteAverage * 10)}% Match
      </span>
      <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
        {getMovieQuality(movie.popularity, movie.releaseDate)}
      </span>
      <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
        {movie.mediaType === "tv" ? "TV" : "Movie"}
      </span>
      <span>{formatYear(movie.releaseDate)}</span>
      <span className="text-yellow-500">
        ★ {movie.voteAverage.toFixed(1)}
      </span>
    </div>
  )
}
