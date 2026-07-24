import { Search } from "lucide-react"
import type { AdminAnalyticsData } from "../types/admin.types"

interface TopSearchQueriesCardProps {
  data: AdminAnalyticsData | null
}

export function TopSearchQueriesCard({ data }: TopSearchQueriesCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
        <Search className="h-5 w-5 text-amber-500" />
        Top Search Queries
      </h2>

      <div className="mt-4 max-h-[220px] space-y-2 overflow-y-auto pr-1">
        {data && data.topSearches.length > 0 ? (
          data.topSearches.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-800/40 px-3 py-2 text-xs"
            >
              <span className="font-medium text-white">"{item.query}"</span>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400">
                {item.count} searches
              </span>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs text-neutral-500">
            No search queries recorded yet.
          </p>
        )}
      </div>
    </div>
  )
}
