import { useState } from "react"
import { motion } from "motion/react"
import { Play } from "lucide-react"
import { useTvSeasonEpisodes } from "../hooks/use-movie-detail"
import { getImageUrl } from "@/helpers/image-url"
import { Skeleton } from "@/components/ui/skeleton"
import type { TvSeason } from "@/types/movie.types"
import { Link } from "@tanstack/react-router"

interface EpisodesSectionProps {
  tvId: string
  seasons?: TvSeason[]
}

function formatRuntime(minutes?: number | null): string {
  if (!minutes) return ""
  return `${minutes}m`
}

export function EpisodesSection({ tvId, seasons = [] }: EpisodesSectionProps) {
  // Filter out season 0 (Specials) if regular seasons exist, or keep valid ones
  const validSeasons = seasons.filter((s) => s.episodeCount > 0)
  const defaultSeason =
    validSeasons.find((s) => s.seasonNumber === 1)?.seasonNumber ??
    validSeasons[0]?.seasonNumber ??
    1

  const [selectedSeason, setSelectedSeason] = useState<number>(defaultSeason)
  const { data: seasonDetail, isPending } = useTvSeasonEpisodes(
    tvId,
    selectedSeason
  )

  if (validSeasons.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white md:text-3xl">
            Episodes
          </h2>
          <p className="text-xs text-white/50">
            Select a season to view episodes
          </p>
        </div>

        {/* Season Selector */}
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="rounded-none border border-white/20 bg-black/80 px-4 py-2.5 text-sm font-semibold text-white focus:border-white focus:outline-none"
        >
          {validSeasons.map((s) => (
            <option key={s.id} value={s.seasonNumber} className="bg-neutral-900 text-white">
              {s.name || `Season ${s.seasonNumber}`} ({s.episodeCount} Episodes)
            </option>
          ))}
        </select>
      </div>

      {/* Episodes List */}
      {isPending ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-none" />
          ))}
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto divide-y divide-white/10 rounded-none border border-white/10 bg-white/5 backdrop-blur-sm shadow-inner">
          {seasonDetail?.episodes.map((ep) => (
            <div
              key={ep.id}
              className="group flex flex-col gap-4 p-4 transition-colors hover:bg-white/10 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
            >
              {/* Episode Number */}
              <span className="hidden font-mono text-xl font-bold text-white/40 sm:block sm:w-8">
                {ep.episode_number}
              </span>

              {/* Thumbnail & Play Overlay */}
              <Link
                to="/$type/$id"
                params={{ type: "tv", id: tvId }}
                search={{
                  play: true,
                  season: ep.season_number,
                  episode: ep.episode_number,
                }}
                className="relative aspect-video w-full shrink-0 overflow-hidden bg-black/40 sm:w-44 md:w-52"
              >
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  </div>
                </div>
              </Link>

              {/* Episode Info */}
              <div className="flex min-w-0 flex-1 flex-col space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="line-clamp-1 text-base font-bold text-white group-hover:text-primary">
                    <span className="sm:hidden">{ep.episode_number}. </span>
                    {ep.name}
                  </h3>
                  {ep.runtime && (
                    <span className="shrink-0 text-xs font-semibold text-white/50">
                      {formatRuntime(ep.runtime)}
                    </span>
                  )}
                </div>
                {ep.overview && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
                    {ep.overview}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  )
}
