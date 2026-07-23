import { useState } from "react"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[70] flex w-full flex-col border-t border-white/15 bg-gradient-to-t from-black via-black/95 to-black/90 p-4 text-white shadow-2xl backdrop-blur-2xl md:px-8 md:pt-5 md:pb-6"
      onClick={(e) => e.stopPropagation()}
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
        <div className="flex flex-row gap-4 overflow-x-auto py-2 pr-2 scrollbar-thin scrollbar-thumb-white/20">
          {seasonDetail?.episodes.map((ep) => {
            const isCurrent =
              selectedSeason === currentSeason &&
              ep.episode_number === currentEpisode

            return (
              <div
                key={ep.id}
                onClick={() => handleSelectEpisode(ep.episode_number)}
                className={`group flex w-60 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border transition-all hover:scale-[1.02] md:w-64 ${
                  isCurrent
                    ? "border-primary/50 bg-white/15 shadow-lg shadow-primary/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                  {ep.still_path ? (
                    <img
                      src={getImageUrl(ep.still_path, "w500")}
                      alt={ep.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                      No Image
                    </div>
                  )}

                  {/* Hover Play Button Overlay */}
                  <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/50 group-hover:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl">
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
      )}
    </motion.div>
  )
}
