import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AdminAnalyticsData } from "../types/admin.types"

interface TopSearchQueriesCardProps {
  data: AdminAnalyticsData | null
}

export function TopSearchQueriesCard({ data }: TopSearchQueriesCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">
            search
          </span>
          <CardTitle>Top Search Queries</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="max-h-[220px]">
          <div className="space-y-2 pr-4">
            {data && data.topSearches.length > 0 ? (
              data.topSearches.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-neutral-800/40 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-white">"{item.query}"</span>
                  <Badge variant="secondary" className="bg-amber-500/10 font-bold text-amber-400">
                    {item.count} searches
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-neutral-500">
                No search queries recorded yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
