import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/auth-store"
import {
  fetchAdminAnalytics,
  type AdminAnalyticsData,
} from "@/api/analytics.api"
import {
  ShieldAlert,
  Users,
  PlayCircle,
  MousePointerClick,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Film,
  UserCheck,
  RefreshCw,
} from "lucide-react"

export default function AdminPage() {
  const { role, isLoading: isAuthLoading } = useAuthStore()
  const [period, setPeriod] = useState<"today" | "week" | "month">("today")
  const [data, setData] = useState<AdminAnalyticsData | null>(null)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    if (role !== "admin") return

    let isMounted = true

    fetchAdminAnalytics(period)
      .then((res) => {
        if (isMounted) setData(res)
      })
      .finally(() => {
        if (isMounted) setIsFetching(false)
      })

    return () => {
      isMounted = false
    }
  }, [role, period])

  const handlePeriodChange = (newPeriod: "today" | "week" | "month") => {
    setPeriod(newPeriod)
    setIsFetching(true)
  }

  const handleRefresh = () => {
    setIsFetching(true)
    fetchAdminAnalytics(period)
      .then((res) => setData(res))
      .finally(() => setIsFetching(false))
  }

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-20">
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <RefreshCw className="h-5 w-5 animate-spin text-red-500" />
          <span>Verifying admin permissions...</span>
        </div>
      </div>
    )
  }

  // Access Denied for non-admin
  if (role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-6 pt-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          You do not have administrative privileges to view the Analytics
          Dashboard. Only users with the{" "}
          <span className="font-semibold text-red-400">Admin</span> role can
          access this page.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-red-500 active:scale-95"
        >
          Return to Home Page
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 pt-24">
      {/* Top Header & Period Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white md:text-3xl">
              Admin Analytics Dashboard
            </h1>
            <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-red-500 uppercase ring-1 ring-red-500/30">
              ADMIN
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Real-time traffic, media consumption stats, and logged-in user watch
            logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-neutral-900/90 p-1 ring-1 ring-white/10">
            {(
              [
                { id: "today", label: "Today" },
                { id: "week", label: "This Week" },
                { id: "month", label: "This Month" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePeriodChange(item.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === item.id
                    ? "bg-red-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-neutral-900 text-neutral-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin text-red-500" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold tracking-wider uppercase">
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
            <span className="text-xs font-semibold tracking-wider uppercase">
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
            <span className="text-xs font-semibold tracking-wider uppercase">
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

      {/* Grid: Section 1 & Section 2 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Device & Browser Breakdown */}
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
                        ? Math.round(
                            (data.devices.desktop / data.totalVisits) * 100
                          )
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
                        ? Math.round(
                            (data.devices.mobile / data.totalVisits) * 100
                          )
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
                        ? Math.round(
                            (data.devices.tablet / data.totalVisits) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Browsers List */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">
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

        {/* Top Search Queries */}
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
      </div>

      {/* Movie & Series Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Played Movies */}
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
                    <span className="py-0.2 rounded bg-white/10 px-1.5 text-[10px] text-neutral-400 uppercase">
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

        {/* Top Clicked Movies */}
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
                    <span className="py-0.2 rounded bg-white/10 px-1.5 text-[10px] text-neutral-400 uppercase">
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
      </div>

      {/* Logged-In User Watch Activity Feed */}
      <div className="mt-6 rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
          <UserCheck className="h-5 w-5 text-red-500" />
          Logged-In User Watch Activity Log
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Real-time log of what logged-in users are watching
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-neutral-400">
              <tr>
                <th className="px-3 py-2 font-semibold">User Email</th>
                <th className="px-3 py-2 font-semibold">Watched Title</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {data && data.userWatchActivity.length > 0 ? (
                data.userWatchActivity.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-3 py-2.5 font-semibold text-white">
                      {log.userEmail}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-red-400">
                      {log.mediaTitle}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-neutral-300 uppercase">
                        {log.mediaType}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-neutral-400">
                      {new Date(log.timestamp).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-neutral-500">
                    No logged-in user watch activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
