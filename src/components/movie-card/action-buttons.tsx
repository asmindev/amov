import { Link } from "@tanstack/react-router"
import { Plus, Check, ThumbsUp, ChevronDown } from "lucide-react"
import { useWatchlistStore } from "@/stores/watchlist-store"
import { useInWatchlist } from "@/hooks/use-watchlist"
import type { Movie } from "@/types/movie.types"

interface ActionButtonsProps {
  movie: Movie
  onTrackClick: () => void
  /** "expand" (h-7 w-9) or "popup" (h-7 w-9 but chevron is larger). */
  variant?: "expand" | "popup"
}

export function ActionButtons({ movie, onTrackClick, variant = "expand" }: ActionButtonsProps) {
  const inList = useInWatchlist(movie.mediaType || "movie", movie.id)
  const toggle = useWatchlistStore((s) => s.toggle)
  const btnClass = "flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80"
  const chevronClass = variant === "popup"
    ? "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80"
    : "flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80"

  return (
    <div className="flex shrink-0 items-center justify-between px-3 pt-3 pb-2">
      <div className="flex gap-1.5">
        <Link
          to="/$type/$id"
          params={{
            type: movie.mediaType || "movie",
            id: String(movie.id),
          }}
          className="flex h-7 w-9 items-center justify-center bg-primary transition-colors hover:bg-primary/90"
          onClick={onTrackClick}
        >
          <span className="material-symbols-outlined fill !text-[18px]">
            play_arrow
          </span>
        </Link>
        <button
          type="button"
          aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
          onClick={(e) => {
            e.stopPropagation()
            toggle(movie.mediaType || "movie", movie.id)
          }}
          className={btnClass}
        >
          {inList ? (
            <Check className={variant === "popup" ? "h-4 w-4" : "h-3.5 w-3.5"} />
          ) : (
            <Plus className={variant === "popup" ? "h-4 w-4" : "h-3.5 w-3.5"} />
          )}
        </button>
        <button className={btnClass}>
          <ThumbsUp className={variant === "popup" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        </button>
      </div>
      <Link
        to="/$type/$id"
        params={{
          type: movie.mediaType || "movie",
          id: String(movie.id),
        }}
        className={chevronClass}
        onClick={onTrackClick}
      >
        <ChevronDown className="h-4 w-4" />
      </Link>
    </div>
  )
}
