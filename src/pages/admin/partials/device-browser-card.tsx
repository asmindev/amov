import { Monitor, Smartphone, Tablet } from "lucide-react"
import type { AdminAnalyticsData } from "../types/admin.types"

interface DeviceBrowserCardProps {
  data: AdminAnalyticsData | null
}

export function DeviceBrowserCard({ data }: DeviceBrowserCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
        <Monitor className="h-5 w-5 text-red-500" />
        Device & Browser Breakdown
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5 text-neutral-300" /> Desktop
            </span>
            <span className="font-bold text-white">
              {data?.devices.desktop || 0}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-red-600 transition-all duration-500"
              style={{
                width: `${
                  data && data.totalVisits > 0
                    ? Math.round((data.devices.desktop / data.totalVisits) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-neutral-300" /> Mobile
            </span>
            <span className="font-bold text-white">
              {data?.devices.mobile || 0}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{
                width: `${
                  data && data.totalVisits > 0
                    ? Math.round((data.devices.mobile / data.totalVisits) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Tablet className="h-3.5 w-3.5 text-neutral-300" /> Tablet
            </span>
            <span className="font-bold text-white">
              {data?.devices.tablet || 0}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${
                  data && data.totalVisits > 0
                    ? Math.round((data.devices.tablet / data.totalVisits) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Browsers List */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Popular Browsers
          </h3>
          <div className="flex flex-wrap gap-2">
            {data && Object.keys(data.browsers).length > 0 ? (
              Object.entries(data.browsers).map(([bName, count]) => (
                <span
                  key={bName}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-300"
                >
                  <span className="font-semibold text-white">{bName}:</span>
                  <span className="text-neutral-400">{count}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-neutral-500">
                No browser data recorded yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
