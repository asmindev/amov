import { PlayCircle } from "lucide-react"
import type { AdminAnalyticsData } from "../types/admin.types"

interface TopPlayedCardProps {
  data: AdminAnalyticsData | null
}

export function TopPlayedCard({ data }: TopPlayedCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
        <PlayCircle className="h-5 w-5 text-emerald-500" />
        Top Played Movies & Series
      </h2>

      <div className="mt-4 max-h-[300px] space-y-2 overflow-y-auto pr-1">
        {data && data.topPlayed.length > 0 ? (
          data.topPlayed.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-800/40 px-3 py-2 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2 pr-2">
                <span className="font-mono text-xs font-bold text-neutral-500">
                  #{idx + 1}
                </span>
                <span className="truncate font-semibold text-white">
                  {item.title}
                </span>
                <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-neutral-400 uppercase">
                  {item.type}
                </span>
              </div>
              <span className="shrink-0 rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400">
                {item.count} plays
              </span>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs text-neutral-500">
            No played media data recorded yet.
          </p>
        )}
      </div>
    </div>
  )
}
