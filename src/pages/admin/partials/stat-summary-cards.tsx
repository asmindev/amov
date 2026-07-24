import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { AdminAnalyticsData, AdminPeriod } from "../types/admin.types"

interface StatSummaryCardsProps {
  data: AdminAnalyticsData | null
  period: AdminPeriod
}

export function StatSummaryCards({ data, period }: StatSummaryCardsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
              Total Page Visits
            </CardTitle>
            <span className="material-symbols-outlined text-blue-400">
              group
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">
            {data ? data.totalVisits.toLocaleString() : "..."}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {period === "today"
              ? "Recorded today"
              : period === "week"
                ? "Past 7 days"
                : "Past 30 days"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
              Total Media Played
            </CardTitle>
            <span className="material-symbols-outlined text-emerald-400">
              play_circle
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">
            {data ? data.totalPlays.toLocaleString() : "..."}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Video streams started
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
              Total Card Clicks
            </CardTitle>
            <span className="material-symbols-outlined text-amber-400">
              ads_click
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">
            {data ? data.totalClicks.toLocaleString() : "..."}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Movie detail cards opened
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
