import { CommandItem } from "@/components/ui/command"
import { getImageUrl } from "@/helpers/image-url"
import { formatYear } from "@/helpers/format-date"
import { Star, Clapperboard, Tv } from "lucide-react"
import type { Movie } from "@/types/movie.types"

interface SearchItemProps {
  item: Movie
  onSelect: () => void
  showType?: boolean
  showRating?: boolean
}

export function SearchItem({
  item,
  onSelect,
  showType = true,
  showRating = true,
}: SearchItemProps) {
  return (
    <CommandItem
      value={`${item.mediaType}-${item.id}`}
      className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 aria-selected:bg-white/[0.06]"
      onSelect={onSelect}
    >
      <div className="relative h-[60px] w-[40px] shrink-0 overflow-hidden rounded border border-white/[0.06] bg-white/[0.04]">
        {item.posterPath ? (
          <img
            src={getImageUrl(item.posterPath, "w92")}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-200 group-aria-selected:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {item.mediaType === "movie" ? (
              <Clapperboard className="h-4 w-4 text-white/20" />
            ) : (
              <Tv className="h-4 w-4 text-white/20" />
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-white/90">
            {item.title}
          </span>
          {showType && (
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
                item.mediaType === "movie"
                  ? "bg-primary/15 text-primary"
                  : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {item.mediaType === "movie" ? "Movie" : "TV"}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-white/50">
          {showRating && item.voteAverage > 0 && (
            <span className="flex items-center gap-1 text-[#46d369]">
              <Star className="h-3 w-3 fill-[#46d369]" />
              {item.voteAverage.toFixed(1)}
            </span>
          )}
          <span>{formatYear(item.releaseDate)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all duration-200 group-aria-selected:opacity-100">
        <button
          type="button"
          onClick={onSelect}
          className="flex h-7 w-9 items-center justify-center bg-primary transition-colors hover:bg-primary/90"
        >
          <span className="material-symbols-outlined fill !text-[18px]">
            play_arrow
          </span>
        </button>
        <button
          type="button"
          className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80"
        >
          <span className="material-symbols-outlined !text-[16px]">add</span>
        </button>
      </div>
    </CommandItem>
  )
}
