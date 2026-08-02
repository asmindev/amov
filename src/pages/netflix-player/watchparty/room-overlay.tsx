import { useMemo, useState } from "react"
import { copyToClipboard } from "@/helpers/clipboard"
import type { WatchpartyMember } from "@/api/watchparty.types"
import type { WatchpartyStatus } from "../watchparty/use-watchparty-realtime"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface WatchpartyPopoverProps {
  peers: WatchpartyMember[]
  status: WatchpartyStatus
  roomSlug: string | null
  mediaType: "movie" | "tv"
  movieId: number
  season?: number
  episode?: number
  onRequestSync?: () => void
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

export function WatchpartyPopover({
  peers,
  status,
  roomSlug,
  mediaType,
  movieId,
  season,
  episode,
  onRequestSync,
}: WatchpartyPopoverProps) {
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

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="group/btn relative flex max-md:h-10 max-md:w-10 h-12 w-12 scale-95 flex-col items-center justify-center rounded-full text-primary transition-colors hover:bg-white/10 hover:text-white active:scale-90"
        >
          <span className="material-symbols-outlined text-2xl md:text-3xl!">
            groups
          </span>
          {connected && peers.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white shadow-sm">
              {peers.length + 1}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="z-50 w-64 rounded-xl border border-white/15 bg-black/85 p-3 text-white shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg text-primary">
              groups
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {connected ? `Watchparty (${peers.length + 1})` : STATUS_LABEL[status]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onRequestSync) {
                onRequestSync()
                setSyncingFeedback(true)
                setTimeout(() => setSyncingFeedback(false), 1500)
              }
            }}
            className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90 hover:bg-white/20"
          >
            <span
              className={`material-symbols-outlined !text-[12px] ${
                syncingFeedback ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
            {syncingFeedback ? "Syncing…" : "Sync"}
          </button>
        </div>

        {/* Invite link button */}
        <button
          type="button"
          onClick={handleInvite}
          disabled={!roomUrl}
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/20 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/30 disabled:opacity-50"
        >
          <span className="material-symbols-outlined !text-[14px]">
            {copied ? "check" : "link"}
          </span>
          {copied ? "Link Copied!" : "Copy Invite Link"}
        </button>

        {/* Peers list */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Viewers in Room
          </span>
          <div className="max-h-36 space-y-1 overflow-y-auto pr-1 text-xs">
            <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1 text-white/90">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                YOU
              </span>
              <span className="truncate font-medium">You (Host/Viewer)</span>
            </div>
            {peers.map((peer) => (
              <div
                key={peer.userId}
                className="flex items-center gap-2 rounded px-2 py-1 text-white/80 hover:bg-white/5"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold text-white">
                  {initials(peer.displayName ?? "", peer.email)}
                </span>
                <span className="truncate">
                  {peer.displayName || peer.email || peer.userId.slice(0, 6)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
// Export alias for backward compatibility
export const RoomOverlay = WatchpartyPopover
