import { useEffect } from "react"
import { useLocation } from "@tanstack/react-router"
import { recordAnalyticsEvent } from "@/api/analytics.api"

export function useAnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    // 1. Do not track admin dashboard views as public page visits
    if (location.pathname.startsWith("/admin")) return

    // 2. Prevent duplicate tracking within 1 second window (React StrictMode deduplication)
    const key = `amov_track_${location.pathname}`
    const lastTracked = sessionStorage.getItem(key)
    const now = Date.now()

    if (lastTracked && now - Number(lastTracked) < 1000) {
      return
    }

    sessionStorage.setItem(key, String(now))

    void recordAnalyticsEvent({
      eventType: "page_view",
      path: location.pathname,
    })
  }, [location.pathname])
}
