import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { WatchpartyMember } from "@/api/watchparty.types"

const CHANNEL_PREFIX = "watchparty"

export type WatchpartyStatus = "idle" | "connecting" | "subscribed" | "error"

interface UseWatchpartyRealtimeOpts {
  roomId: string | null
  userId: string | null
  displayName?: string
  enabled: boolean
  onPlay: () => void
  onPause: () => void
  onSeek: (t: number) => void
}

interface UseWatchpartyRealtimeReturn {
  peers: WatchpartyMember[]
  status: WatchpartyStatus
  sendPlay: () => void
  sendPause: () => void
  sendSeek: (t: number) => void
}

export function useWatchpartyRealtime({
  roomId,
  userId,
  displayName,
  enabled,
  onPlay,
  onPause,
  onSeek,
}: UseWatchpartyRealtimeOpts): UseWatchpartyRealtimeReturn {
  const [status, setStatus] = useState<WatchpartyStatus>("idle")
  const [peers, setPeers] = useState<WatchpartyMember[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Keep latest callbacks without re-subscribing the channel
  const onPlayRef = useRef(onPlay)
  const onPauseRef = useRef(onPause)
  const onSeekRef = useRef(onSeek)
  useEffect(() => {
    onPlayRef.current = onPlay
    onPauseRef.current = onPause
    onSeekRef.current = onSeek
  }, [onPlay, onPause, onSeek])

  useEffect(() => {
    if (!supabase || !enabled || !roomId || !userId) {
      return
    }

    let disposed = false

    const channel = supabase.channel(`${CHANNEL_PREFIX}:${roomId}`, {
      config: { broadcast: { self: false } },
    })
    channelRef.current = channel

    const handleBroadcast = (payload: {
      event: string
      payload: { senderId?: string; currentTime?: number }
    }) => {
      if (disposed) return
      const p = payload.payload
      if (!p || p.senderId === userId) return
      switch (payload.event) {
        case "play":
          onPlayRef.current()
          break
        case "pause":
          onPauseRef.current()
          break
        case "seek":
          if (typeof p.currentTime === "number") {
            onSeekRef.current(p.currentTime)
          }
          break
      }
    }

    channel.on("broadcast", { event: "play" }, handleBroadcast)
    channel.on("broadcast", { event: "pause" }, handleBroadcast)
    channel.on("broadcast", { event: "seek" }, handleBroadcast)

    interface TrackedPresence {
      userId: string
      displayName?: string
      joinedAt: number
    }

    const handlePresenceSync = () => {
      if (disposed) return
      const state = channel.presenceState() as Record<
        string,
        TrackedPresence[]
      >
      const members: WatchpartyMember[] = Object.values(state).flatMap(
        (presences) =>
          presences.map((presence) => ({
            userId: String(presence.userId ?? ""),
            displayName: presence.displayName,
            joinedAt: Number(presence.joinedAt ?? 0),
          }))
      )
      // Exclude self so the roster shows *other* viewers and the count is
      // "N others watching" rather than counting yourself.
      setPeers(members.filter((m) => m.userId !== userId))
    }

    channel.on("presence", { event: "sync" }, handlePresenceSync)

    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const retrySubscribe = () => {
      if (disposed) return
      setStatus("error")
      retryTimer = setTimeout(() => {
        if (disposed) return
        channel.subscribe((subStatus) => handleSubscribe(subStatus))
      }, 3000)
    }

    const handleSubscribe = (subStatus: string) => {
      if (disposed) return
      if (subStatus === "SUBSCRIBED") {
        setStatus("subscribed")
        void channel
          .track({
            userId,
            displayName,
            joinedAt: Date.now(),
          })
          .catch(() => {})
      } else if (subStatus === "CHANNEL_ERROR" || subStatus === "TIMED_OUT") {
        retrySubscribe()
      } else if (subStatus === "CLOSED") {
        setStatus("idle")
      }
    }

    channel.subscribe((subStatus) => handleSubscribe(subStatus))

    return () => {
      disposed = true
      if (retryTimer) clearTimeout(retryTimer)
      setPeers([])
      setStatus("idle")
      if (supabase) {
        void supabase.removeChannel(channel)
      }
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, enabled])

  const sendPlay = useCallback(() => {
    if (!channelRef.current || !userId) return
    void channelRef.current
      .send({
        type: "broadcast",
        event: "play",
        payload: { senderId: userId, t: Date.now() },
      })
      .catch(() => {})
  }, [userId])

  const sendPause = useCallback(() => {
    if (!channelRef.current || !userId) return
    void channelRef.current
      .send({
        type: "broadcast",
        event: "pause",
        payload: { senderId: userId, t: Date.now() },
      })
      .catch(() => {})
  }, [userId])

  const sendSeek = useCallback(
    (currentTime: number) => {
      if (!channelRef.current || !userId) return
      void channelRef.current
        .send({
          type: "broadcast",
          event: "seek",
          payload: { senderId: userId, t: Date.now(), currentTime },
        })
        .catch(() => {})
    },
    [userId]
  )

  return useMemo(
    () => ({
      peers,
      status,
      sendPlay,
      sendPause,
      sendSeek,
    }),
    [peers, status, sendPlay, sendPause, sendSeek]
  )
}
