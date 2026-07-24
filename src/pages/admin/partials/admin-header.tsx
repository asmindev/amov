import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
          <Badge variant="destructive" className="text-[10px] font-black tracking-wider uppercase">
            ADMIN
          </Badge>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          Real-time traffic, media consumption stats, and logged-in user watch
          logs
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Tabs value={period} onValueChange={onPeriodChange}>
          <TabsList className="bg-neutral-900/90 ring-1 ring-white/10">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isFetching}
          className="shrink-0"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${isFetching ? "animate-spin text-red-500" : ""}`}
          >
            refresh
          </span>
        </Button>
      </div>
    </div>
  )
}
