import { useState } from "react"
import { motion } from "motion/react"
import { X, Play, Check } from "lucide-react"
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pointer-events-auto fixed bottom-[20%] left-1/2 z-[60] flex w-[92%] max-w-3xl -translate-x-1/2 flex-col rounded-2xl border border-white/15 bg-black/90 p-5 text-white shadow-2xl backdrop-blur-xl md:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-lg font-bold tracking-tight md:text-xl">
            Episodes
          </h3>

          {/* Season Selector */}
          {validSeasons.length > 0 && (
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="rounded-lg border border-white/20 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white focus:border-white focus:outline-none"
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
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Episode List */}
      {isPending ? (
        <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-20 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="max-h-[50vh] divide-y divide-white/10 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
          {seasonDetail?.episodes.map((ep) => {
            const isCurrent =
              selectedSeason === currentSeason &&
              ep.episode_number === currentEpisode

            return (
              <div
                key={ep.id}
                onClick={() => handleSelectEpisode(ep.episode_number)}
                className={`group flex cursor-pointer items-center justify-between gap-4 p-3 transition-colors hover:bg-white/10 md:p-4 ${
                  isCurrent ? "bg-white/10" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-black/50 md:w-36">
                  {ep.still_path ? (
                    <img
                      src={getImageUrl(ep.still_path, "w500")}
                      alt={ep.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-white/40">
                      No Image
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white/50">
                      E{ep.episode_number}
                    </span>
                    <h4
                      className={`line-clamp-1 text-sm font-bold ${
                        isCurrent ? "text-primary" : "text-white"
                      }`}
                    >
                      {ep.name}
                    </h4>
                  </div>

                  {ep.overview && (
                    <p className="line-clamp-2 text-xs text-white/60">
                      {ep.overview}
                    </p>
                  )}
                </div>

                {/* Status Indicator / Duration */}
                <div className="flex shrink-0 items-center gap-3">
                  {ep.runtime && (
                    <span className="hidden text-xs text-white/40 md:inline">
                      {formatRuntime(ep.runtime)}
                    </span>
                  )}
                  {isCurrent ? (
                    <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary border border-primary/30">
                      <Check className="h-3 w-3" /> Playing
                    </span>
                  ) : (
                    <button className="hidden rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 transition-colors group-hover:border-white group-hover:bg-white group-hover:text-black md:block">
                      Play
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
