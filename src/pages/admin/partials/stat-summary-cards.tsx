import { Users, PlayCircle, MousePointerClick } from "lucide-react"
import type { AdminAnalyticsData, AdminPeriod } from "../types/admin.types"

interface StatSummaryCardsProps {
  data: AdminAnalyticsData | null
  period: AdminPeriod
}

export function StatSummaryCards({ data, period }: StatSummaryCardsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Page Visits
          </span>
          <Users className="h-5 w-5 text-blue-400" />
        </div>
        <div className="mt-3 text-3xl font-black text-white">
          {data ? data.totalVisits.toLocaleString() : "..."}
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          {period === "today"
            ? "Recorded today"
            : period === "week"
              ? "Past 7 days"
              : "Past 30 days"}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Media Played
          </span>
          <PlayCircle className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="mt-3 text-3xl font-black text-white">
          {data ? data.totalPlays.toLocaleString() : "..."}
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Video streams started
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Card Clicks
          </span>
          <MousePointerClick className="h-5 w-5 text-amber-400" />
        </div>
        <div className="mt-3 text-3xl font-black text-white">
          {data ? data.totalClicks.toLocaleString() : "..."}
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Movie detail cards opened
        </p>
      </div>
    </div>
  )
}
