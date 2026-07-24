import { RefreshCw } from "lucide-react"
import type { AdminPeriod } from "../types/admin.types"

interface AdminHeaderProps {
  period: AdminPeriod
  isFetching: boolean
  onPeriodChange: (period: AdminPeriod) => void
  onRefresh: () => void
}

export function AdminHeader({
  period,
  isFetching,
  onPeriodChange,
  onRefresh,
}: AdminHeaderProps) {
  return (
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
              onClick={() => onPeriodChange(item.id)}
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
          onClick={onRefresh}
          disabled={isFetching}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-neutral-900 text-neutral-300 transition-colors hover:border-white/20 hover:text-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin text-red-500" : ""}`}
          />
        </button>
      </div>
    </div>
  )
}
