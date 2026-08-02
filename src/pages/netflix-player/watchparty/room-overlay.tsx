import { useMemo, useState } from "react"
import { copyToClipboard } from "@/helpers/clipboard"
import type { WatchpartyMember } from "@/api/watchparty.types"
import type { WatchpartyStatus } from "../watchparty/use-watchparty-realtime"

interface RoomOverlayProps {
  peers: WatchpartyMember[]
  status: WatchpartyStatus
  roomSlug: string | null
  mediaType: "movie" | "tv"
  movieId: number
  season?: number
  episode?: number
  onRequestSync?: () => void
  isSynced?: boolean
}

function initials(name: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase()
  }
  return (email?.[0] ?? "?").toUpperCase()
}

const STATUS_LABEL: Record<WatchpartyStatus, string> = {
  idle: "Watchparty",
  connecting: "Connecting…",
  subscribed: "Watchparty",
  error: "Reconnecting…",
}

export function RoomOverlay({
  peers,
  status,
  roomSlug,
  mediaType,
  movieId,
  season,
  episode,
  onRequestSync,
  isSynced = true,
}: RoomOverlayProps) {
  const [copied, setCopied] = useState(false)
  const [syncingFeedback, setSyncingFeedback] = useState(false)

  const roomUrl = useMemo(() => {
    if (!roomSlug) return null
    const params = new URLSearchParams({ room: roomSlug })
    if (season !== undefined) params.set("season", String(season))
    if (episode !== undefined) params.set("episode", String(episode))
    const base = `${mediaType}/${movieId}/netflix`
    return `${window.location.origin}${import.meta.env.BASE_URL}${base}?${params.toString()}`
  }, [roomSlug, mediaType, movieId, season, episode])

  const handleInvite = async () => {
    if (!roomUrl) return
    const ok = await copyToClipboard(roomUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const connected = status === "subscribed"
  const fullySynced = connected && isSynced

  return (
    <div className="pointer-events-auto fixed top-20 right-4 z-50 flex flex-col items-end gap-2 md:top-24 md:right-6">
      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-black/60 px-3 py-1.5 backdrop-blur-md">
        {/* LIVE Sync Indicator & Manual Sync Button */}
        <button
          type="button"
          onClick={() => {
            if (onRequestSync) {
              onRequestSync()
              setSyncingFeedback(true)
              setTimeout(() => setSyncingFeedback(false), 1500)
            }
          }}
          title={
            fullySynced
              ? "In Sync with room peers"
              : "Desynced! Click to manually sync playback position with peers"
          }
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
            fullySynced
              ? "bg-red-600/90 text-white shadow-lg shadow-red-600/20 hover:bg-red-500"
              : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {fullySynced && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                fullySynced ? "bg-white" : "bg-gray-400"
              }`}
            />
          </span>
          <span>{syncingFeedback ? "Syncing…" : "LIVE"}</span>
        </button>

        <span className="material-symbols-outlined !text-[16px] text-primary">
          groups
        </span>
        <span className="text-xs font-semibold text-white">
          {connected ? `${peers.length}` : STATUS_LABEL[status]}
        </span>
        <button
          type="button"
          onClick={handleInvite}
          disabled={!roomUrl}
          className="ml-1 flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined !text-[14px]">
            {copied ? "check" : "link"}
          </span>
          {copied ? "Copied!" : "Invite"}
        </button>
      </div>

      {peers.length > 0 && (
        <div className="flex max-w-[240px] flex-col gap-1 rounded-xl border border-border/60 bg-black/60 px-3 py-2 backdrop-blur-md">
          {peers.map((peer) => (
            <div
              key={peer.userId}
              className="flex items-center gap-2 text-xs text-white/80"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/30 text-[10px] font-bold text-white">
                {initials(peer.displayName ?? "", peer.email)}
              </span>
              <span className="truncate">
                {peer.displayName || peer.email || peer.userId.slice(0, 6)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
