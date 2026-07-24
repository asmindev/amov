import { useAdminAnalytics } from "./hooks/use-admin-analytics"
import { LoadingView } from "./partials/loading-view"
import { AccessDeniedView } from "./partials/access-denied-view"
import { AdminHeader } from "./partials/admin-header"
import { StatSummaryCards } from "./partials/stat-summary-cards"
import { DeviceBrowserCard } from "./partials/device-browser-card"
import { TopSearchQueriesCard } from "./partials/top-search-queries-card"
import { TopPlayedCard } from "./partials/top-played-card"
import { TopClickedCard } from "./partials/top-clicked-card"
import { VisitorLogsTable } from "./partials/visitor-logs-table"
import { WatchActivityTable } from "./partials/watch-activity-table"

export default function AdminPage() {
  const {
    role,
    isAuthLoading,
    period,
    data,
    isFetching,
    handlePeriodChange,
    handleRefresh,
  } = useAdminAnalytics()

  if (isAuthLoading) return <LoadingView />
  if (role !== "admin") return <AccessDeniedView />

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 pt-24">
      <AdminHeader
        period={period}
        isFetching={isFetching}
        onPeriodChange={handlePeriodChange}
        onRefresh={handleRefresh}
      />

      <StatSummaryCards data={data} period={period} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DeviceBrowserCard data={data} />
        <TopSearchQueriesCard data={data} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopPlayedCard data={data} />
        <TopClickedCard data={data} />
      </div>

      <VisitorLogsTable data={data} />
      <WatchActivityTable data={data} />
    </div>
  )
}
