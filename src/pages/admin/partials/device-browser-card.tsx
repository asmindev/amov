import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { AdminAnalyticsData } from "../types/admin.types"

interface DeviceBrowserCardProps {
  data: AdminAnalyticsData | null
}

function getPercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

export function DeviceBrowserCard({ data }: DeviceBrowserCardProps) {
  const total = data?.totalVisits ?? 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500">
            desktop_windows
          </span>
          <CardTitle>Device & Browser Breakdown</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="[&_[data-slot=progress-indicator]]:bg-red-600">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-neutral-300">
                desktop_windows
              </span>
              Desktop
            </span>
            <span className="font-bold text-white">
              {data?.devices.desktop || 0}
            </span>
          </div>
          <Progress value={getPercentage(data?.devices.desktop ?? 0, total)} />
        </div>

        <div className="[&_[data-slot=progress-indicator]]:bg-amber-500">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-neutral-300">
                smartphone
              </span>
              Mobile
            </span>
            <span className="font-bold text-white">
              {data?.devices.mobile || 0}
            </span>
          </div>
          <Progress value={getPercentage(data?.devices.mobile ?? 0, total)} />
        </div>

        <div className="[&_[data-slot=progress-indicator]]:bg-blue-500">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-neutral-300">
                tablet
              </span>
              Tablet
            </span>
            <span className="font-bold text-white">
              {data?.devices.tablet || 0}
            </span>
          </div>
          <Progress value={getPercentage(data?.devices.tablet ?? 0, total)} />
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <h3 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">
            Popular Browsers
          </h3>
          <div className="flex flex-wrap gap-2">
            {data && Object.keys(data.browsers).length > 0 ? (
              Object.entries(data.browsers).map(([bName, count]) => (
                <Badge key={bName} className="gap-1.5">
                  <span className="font-semibold text-white">{bName}:</span>
                  <span className="text-foreground">{count}</span>
                </Badge>
              ))
            ) : (
              <span className="text-xs text-neutral-500">
                No browser data recorded yet
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
