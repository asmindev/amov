import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import {
  fetchAdminAnalytics,
  type AdminAnalyticsData,
} from "@/api/analytics.api"
import type { AdminPeriod } from "../types/admin.types"

export function useAdminAnalytics() {
  const { role, isLoading: isAuthLoading } = useAuthStore()
  const [period, setPeriod] = useState<AdminPeriod>("today")
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

  const handlePeriodChange = (newPeriod: AdminPeriod) => {
    setPeriod(newPeriod)
    setIsFetching(true)
  }

  const handleRefresh = () => {
    setIsFetching(true)
    fetchAdminAnalytics(period)
      .then((res) => setData(res))
      .finally(() => setIsFetching(false))
  }

  return {
    role,
    isAuthLoading,
    period,
    data,
    isFetching,
    handlePeriodChange,
    handleRefresh,
  }
}
