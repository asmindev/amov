import { useRef, useState } from "react"
import { motion } from "motion/react"
import { X, Check } from "lucide-react"
import { useTvSeasonEpisodes } from "@/pages/movie-detail/hooks/use-movie-detail"
import { getImageUrl } from "@/helpers/image-url"
import { Skeleton } from "@/components/ui/skeleton"
import type { TvSeason } from "@/types/movie.types"
import { useNavigate } from "@tanstack/react-router"

interface EpisodesDrawerProps {
  tvId: string
  currentSeason: number
  currentEpisode: number
  seasons?: TvSeason[]
  onClose: () => void
}

function formatRuntime(minutes?: number | null): string {
  if (!minutes) return ""
  return `${minutes}m`
}

export function EpisodesDrawer({
  tvId,
  currentSeason,
  currentEpisode,
  seasons = [],
  onClose,
}: EpisodesDrawerProps) {
  const navigate = useNavigate()
  const carouselRef = useRef<HTMLDivElement>(null)
  const validSeasons = seasons.filter((s) => s.episodeCount > 0)

  const [selectedSeason, setSelectedSeason] = useState<number>(
    currentSeason || (validSeasons[0]?.seasonNumber ?? 1)
  )

  const { data: seasonDetail, isPending } = useTvSeasonEpisodes(
    tvId,
    selectedSeason
  )

  const handleSelectEpisode = (epNum: number) => {
    void navigate({
      to: "/$type/$id/netflix",
      params: { type: "tv", id: tvId },
      search: { season: selectedSeason, episode: epNum },
    })
    onClose()
  }

  const handleScrollEpisodes = (direction: "left" | "right") => {
    const node = carouselRef.current
    if (!node) return

    const scrollAmount = node.clientWidth * 0.75
    node.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed right-0 bottom-0 left-0 z-70 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div
      className="pointer-events-auto flex w-full flex-col border-t border-white/15 bg-linear-to-t from-black via-black/20 to-black/20 p-4 text-white shadow-2xl backdrop-blur-xl md:px-8 md:pt-5 md:pb-20"

      >

      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-base font-bold tracking-tight md:text-lg">
            Episodes
          </h3>

          {/* Season Selector */}
          {validSeasons.length > 0 && (
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="rounded-lg border border-white/20 bg-neutral-900 px-3 py-1 text-xs font-semibold text-white focus:border-white focus:outline-none"
            >
              {validSeasons.map((s) => (
                <option
                  key={s.id}
                  value={s.seasonNumber}
                  className="bg-neutral-900 text-white"
                >
                  {s.name || `Season ${s.seasonNumber}`} ({s.episodeCount} Ep)
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClose()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Close episodes drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Horizontal Episode Carousel */}
      {isPending ? (
        <div className="flex flex-row gap-4 overflow-x-auto py-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton
              key={n}
              className="h-44 w-60 shrink-0 rounded-xl bg-white/10"
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-2 left-0 z-10 w-14 bg-linear-to-r from-black via-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-2 right-0 z-10 w-14 bg-linear-to-l from-black via-black/70 to-transparent" />

          <button
            type="button"
            onClick={() => handleScrollEpisodes("left")}
            className="absolute top-1/2 left-0 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white/90 transition-colors hover:text-white md:h-11 md:w-11"
            aria-label="Scroll episodes left"
          >
            <span className="material-symbols-outlined !text-[48px]">
              chevron_left
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleScrollEpisodes("right")}
            className="absolute top-1/2 right-0 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white/90 transition-colors hover:text-white md:h-11 md:w-11"
            aria-label="Scroll episodes right"
          >
            <span className="material-symbols-outlined !text-[48px]">
              chevron_right
            </span>
          </button>

          <div
            ref={carouselRef}
            className="flex flex-row gap-4 overflow-x-auto py-2 pl-12 pr-12 scrollbar-thin scrollbar-thumb-white/20"
          >
            {seasonDetail?.episodes.map((ep) => {
              const isCurrent =
                selectedSeason === currentSeason &&
                ep.episode_number === currentEpisode

              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEpisode(ep.episode_number)}
                  className={`flex w-60 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border transition-all hover:scale-[1.02] md:w-64 ${
                    isCurrent
                      ? "border-primary/50 bg-white/15 shadow-lg shadow-primary/10"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="group/thumb relative aspect-video w-full overflow-hidden bg-black/60">
                    {ep.still_path ? (
                      <img
                        src={getImageUrl(ep.still_path, "w500")}
                        alt={ep.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                        No Image
                      </div>
                    )}

                    {/* Hover Play Button & Dark Backdrop Overlay */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover/thumb:opacity-100">
                      <div className="flex h-10 w-10 scale-90 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-200 group-hover/thumb:scale-100">
                        <span className="material-symbols-outlined fill ml-0.5 !text-[24px]">
                          play_arrow
                        </span>
                      </div>
                    </div>

                    {/* EP Number Badge */}
                    <span className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[11px] font-bold text-white/90 backdrop-blur-md">
                      EP {ep.episode_number}
                    </span>

                    {/* Playing Badge */}
                    {isCurrent && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                        <Check className="h-3 w-3" /> PLAYING
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`line-clamp-1 text-xs font-bold ${
                            isCurrent ? "text-primary" : "text-white"
                          }`}
                        >
                          {ep.name}
                        </h4>
                        {ep.runtime && (
                          <span className="shrink-0 text-[10px] text-white/40">
                            {formatRuntime(ep.runtime)}
                          </span>
                        )}
                      </div>

                      {ep.overview && (
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-white/60">
                          {ep.overview}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      </div>

    </motion.div>
  )
}
