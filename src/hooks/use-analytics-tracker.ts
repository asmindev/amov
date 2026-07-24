import { useEffect } from "react"
import { useLocation } from "@tanstack/react-router"
import { recordAnalyticsEvent } from "@/api/analytics.api"

export function useAnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    void recordAnalyticsEvent({
      eventType: "page_view",
      path: location.pathname,
    })
  }, [location.pathname])
}
