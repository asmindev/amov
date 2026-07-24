import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/auth-store"

export type EventType =
  "page_view" | "movie_click" | "movie_play" | "search_query"

export interface AnalyticsEventPayload {
  eventType: EventType
  path?: string
  mediaId?: string
  mediaTitle?: string
  mediaType?: "movie" | "tv"
  searchQuery?: string
}

export interface RecentVisitLog {
  id: string
  timestamp: string
  path: string
  deviceType: string
  browser: string
  country: string
  ip: string
}

export interface AdminAnalyticsData {
  totalVisits: number
  totalPlays: number
  totalClicks: number
  devices: { desktop: number; mobile: number; tablet: number }
  browsers: Record<string, number>
  topPlayed: Array<{
    id: string
    title: string
    type: string
    count: number
  }>
  topClicked: Array<{
    id: string
    title: string
    type: string
    count: number
  }>
  topSearches: Array<{ query: string; count: number }>
  userWatchActivity: Array<{
    id: string
    userEmail: string
    mediaId: string
    mediaTitle: string
    mediaType: string
    timestamp: string
  }>
  lastVisits: RecentVisitLog[]
}

function parseBrowserAndDevice() {
  const ua = navigator.userAgent
  let deviceType = "desktop"
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet"
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(
      ua
    )
  ) {
    deviceType = "mobile"
  }

  let browser = "Other"
  if (ua.includes("Firefox/")) {
    browser = "Firefox"
  } else if (ua.includes("Edg/")) {
    browser = "Edge"
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome"
  } else if (ua.includes("Safari/")) {
    browser = "Safari"
  }

  return { deviceType, browser }
}

async function getClientIpAndCountry(): Promise<{
  ip: string
  country: string
}> {
  try {
    const cached = sessionStorage.getItem("amov_ip_info")
    if (cached) {
      return JSON.parse(cached)
    }

    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      const result = {
        ip: data.ip || "Unknown",
        country: data.country_name || data.country || "Unknown",
      }
      sessionStorage.setItem("amov_ip_info", JSON.stringify(result))
      return result
    }
  } catch {
    // Fallback if IP API is blocked or times out
  }
  return { ip: "Unknown", country: "Unknown" }
}

export async function recordAnalyticsEvent(payload: AnalyticsEventPayload) {
  const client = supabase
  if (!client) return

  try {
    const { user } = useAuthStore.getState()
    const { deviceType, browser } = parseBrowserAndDevice()
    const { ip, country } = await getClientIpAndCountry()

    await client.from("analytics_events").insert({
      event_type: payload.eventType,
      path: payload.path || window.location.pathname,
      media_id: payload.mediaId,
      media_title: payload.mediaTitle,
      media_type: payload.mediaType,
      search_query: payload.searchQuery,
      user_id: user?.id || null,
      user_email: user?.email || null,
      device_type: deviceType,
      browser,
      ip,
      country,
    })
  } catch (err) {
    console.error("[analytics] failed to record event:", err)
  }
}

export async function fetchAdminAnalytics(
  period: "today" | "week" | "month" = "today"
): Promise<AdminAnalyticsData> {
  const client = supabase
  if (!client) {
    return {
      totalVisits: 0,
      totalPlays: 0,
      totalClicks: 0,
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      browsers: {},
      topPlayed: [],
      topClicked: [],
      topSearches: [],
      userWatchActivity: [],
      lastVisits: [],
    }
  }

  const now = new Date()
  const startDate = new Date()
  if (period === "today") {
    startDate.setHours(0, 0, 0, 0)
  } else if (period === "week") {
    startDate.setDate(now.getDate() - 7)
  } else if (period === "month") {
    startDate.setDate(now.getDate() - 30)
  }

  const startDateIso = startDate.toISOString()

  const { data: events, error } = await client
    .from("analytics_events")
    .select("*")
    .gte("created_at", startDateIso)
    .order("created_at", { ascending: false })

  if (error || !events) {
    return {
      totalVisits: 0,
      totalPlays: 0,
      totalClicks: 0,
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      browsers: {},
      topPlayed: [],
      topClicked: [],
      topSearches: [],
      userWatchActivity: [],
      lastVisits: [],
    }
  }

  let totalVisits = 0
  let totalPlays = 0
  let totalClicks = 0
  const devices = { desktop: 0, mobile: 0, tablet: 0 }
  const browsers: Record<string, number> = {}

  const playedMap: Record<
    string,
    { title: string; type: string; count: number }
  > = {}
  const clickedMap: Record<
    string,
    { title: string; type: string; count: number }
  > = {}
  const searchMap: Record<string, number> = {}
  const userWatchActivity: AdminAnalyticsData["userWatchActivity"] = []
  const lastVisits: RecentVisitLog[] = []

  for (const ev of events) {
    if (ev.event_type === "page_view") {
      totalVisits++
      if (lastVisits.length < 10) {
        lastVisits.push({
          id: ev.id,
          timestamp: ev.created_at,
          path: ev.path || "/",
          deviceType: ev.device_type || "desktop",
          browser: ev.browser || "Other",
          country: ev.country || "Unknown",
          ip: ev.ip || "Unknown",
        })
      }
    } else if (ev.event_type === "movie_play") {
      totalPlays++
      if (ev.media_id && ev.media_title) {
        const key = `${ev.media_type || "movie"}:${ev.media_id}`
        if (!playedMap[key]) {
          playedMap[key] = {
            title: ev.media_title,
            type: ev.media_type || "movie",
            count: 0,
          }
        }
        playedMap[key].count++
      }

      if (ev.user_email && ev.media_title) {
        userWatchActivity.push({
          id: ev.id,
          userEmail: ev.user_email,
          mediaId: ev.media_id || "",
          mediaTitle: ev.media_title,
          mediaType: ev.media_type || "movie",
          timestamp: ev.created_at,
        })
      }
    } else if (ev.event_type === "movie_click") {
      totalClicks++
      if (ev.media_id && ev.media_title) {
        const key = `${ev.media_type || "movie"}:${ev.media_id}`
        if (!clickedMap[key]) {
          clickedMap[key] = {
            title: ev.media_title,
            type: ev.media_type || "movie",
            count: 0,
          }
        }
        clickedMap[key].count++
      }
    } else if (ev.event_type === "search_query") {
      if (ev.search_query) {
        const q = ev.search_query.trim().toLowerCase()
        searchMap[q] = (searchMap[q] || 0) + 1
      }
    }

    if (ev.device_type) {
      if (ev.device_type === "mobile") devices.mobile++
      else if (ev.device_type === "tablet") devices.tablet++
      else devices.desktop++
    }

    if (ev.browser) {
      browsers[ev.browser] = (browsers[ev.browser] || 0) + 1
    }
  }

  const topPlayed = Object.entries(playedMap)
    .map(([key, value]) => ({
      id: key.split(":")[1],
      title: value.title,
      type: value.type,
      count: value.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topClicked = Object.entries(clickedMap)
    .map(([key, value]) => ({
      id: key.split(":")[1],
      title: value.title,
      type: value.type,
      count: value.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topSearches = Object.entries(searchMap)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalVisits,
    totalPlays,
    totalClicks,
    devices,
    browsers,
    topPlayed,
    topClicked,
    topSearches,
    userWatchActivity: userWatchActivity.slice(0, 20),
    lastVisits,
  }
}
