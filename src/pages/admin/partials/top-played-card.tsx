import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AdminAnalyticsData } from "../types/admin.types"

interface TopPlayedCardProps {
  data: AdminAnalyticsData | null
}

export function TopPlayedCard({ data }: TopPlayedCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-500">
            play_circle
          </span>
          <CardTitle>Top Played Movies & Series</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2 pr-4">
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
                    <Badge variant="secondary" className="uppercase">
                      {item.type}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="shrink-0 bg-emerald-500/10 font-bold text-emerald-400">
                    {item.count} plays
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-neutral-500">
                No played media data recorded yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
