import { Film } from "lucide-react"
import type { AdminAnalyticsData } from "../types/admin.types"

interface TopClickedCardProps {
  data: AdminAnalyticsData | null
}

export function TopClickedCard({ data }: TopClickedCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
        <Film className="h-5 w-5 text-blue-500" />
        Top Clicked Movies
      </h2>

      <div className="mt-4 max-h-[300px] space-y-2 overflow-y-auto pr-1">
        {data && data.topClicked.length > 0 ? (
          data.topClicked.map((item, idx) => (
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
              <span className="shrink-0 rounded bg-blue-500/10 px-2 py-0.5 font-bold text-blue-400">
                {item.count} clicks
              </span>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs text-neutral-500">
            No click data recorded yet.
          </p>
        )}
      </div>
    </div>
  )
}
