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
  getPlaybackSnapshot?: () => { currentTime: number; playing: boolean }
  onSyncState?: (currentTime: number, playing: boolean) => void
}

interface UseWatchpartyRealtimeReturn {
  peers: WatchpartyMember[]
  status: WatchpartyStatus
  sendPlay: () => void
  sendPause: () => void
  sendSeek: (t: number) => void
  requestSync: () => void
}

export function useWatchpartyRealtime({
  roomId,
  userId,
  displayName,
  enabled,
  onPlay,
  onPause,
  onSeek,
  getPlaybackSnapshot,
  onSyncState,
}: UseWatchpartyRealtimeOpts): UseWatchpartyRealtimeReturn {
  const [status, setStatus] = useState<WatchpartyStatus>("idle")
  const [peers, setPeers] = useState<WatchpartyMember[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Keep latest callbacks without re-subscribing the channel
  const onPlayRef = useRef(onPlay)
  const onPauseRef = useRef(onPause)
  const onSeekRef = useRef(onSeek)
  const getPlaybackSnapshotRef = useRef(getPlaybackSnapshot)
  const onSyncStateRef = useRef(onSyncState)

  useEffect(() => {
    onPlayRef.current = onPlay
    onPauseRef.current = onPause
    onSeekRef.current = onSeek
    getPlaybackSnapshotRef.current = getPlaybackSnapshot
    onSyncStateRef.current = onSyncState
  }, [onPlay, onPause, onSeek, getPlaybackSnapshot, onSyncState])

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
      payload: { senderId?: string; currentTime?: number; playing?: boolean }
    }) => {
      if (disposed) return
      const p = payload.payload
      console.log("[Watchparty Realtime] Received broadcast event:", payload.event, p)
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
        case "request_sync":
          // Existing viewer in room responds with their current playback state
          if (getPlaybackSnapshotRef.current) {
            const snap = getPlaybackSnapshotRef.current()
            console.log("[Watchparty Realtime] Responding to request_sync with state:", snap)
            void channel
              .send({
                type: "broadcast",
                event: "sync_state",
                payload: {
                  senderId: userId,
                  t: Date.now(),
                  currentTime: snap.currentTime,
                  playing: snap.playing,
                },
              })
              .catch(() => {})
          }
          break
        case "sync_state":
          // Newly joined viewer receives current state from an existing peer
          if (typeof p.currentTime === "number" && onSyncStateRef.current) {
            console.log("[Watchparty Realtime] Applying sync_state from peer:", p)
            onSyncStateRef.current(p.currentTime, !!p.playing)
          }
          break
      }
    }

    channel.on("broadcast", { event: "play" }, handleBroadcast)
    channel.on("broadcast", { event: "pause" }, handleBroadcast)
    channel.on("broadcast", { event: "seek" }, handleBroadcast)
    channel.on("broadcast", { event: "request_sync" }, handleBroadcast)
    channel.on("broadcast", { event: "sync_state" }, handleBroadcast)

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

    let requestSyncTimer: ReturnType<typeof setTimeout> | null = null

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

        requestSyncTimer = setTimeout(() => {
          if (disposed || !channelRef.current) return
          console.log("[Watchparty Realtime] Requesting initial sync from peers...")
          void channelRef.current
            .send({
              type: "broadcast",
              event: "request_sync",
              payload: { senderId: userId, t: Date.now() },
            })
            .catch(() => {})
        }, 500)
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
      if (requestSyncTimer) clearTimeout(requestSyncTimer)
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
    console.log("[Watchparty Realtime] Sending broadcast: PLAY", { userId })
    void channelRef.current
      .send({
        type: "broadcast",
        event: "play",
        payload: { senderId: userId, t: Date.now() },
      })
      .catch((err) => console.error("[Watchparty Realtime] Error sending PLAY:", err))
  }, [userId])

  const sendPause = useCallback(() => {
    if (!channelRef.current || !userId) return
    console.log("[Watchparty Realtime] Sending broadcast: PAUSE", { userId })
    void channelRef.current
      .send({
        type: "broadcast",
        event: "pause",
        payload: { senderId: userId, t: Date.now() },
      })
      .catch((err) => console.error("[Watchparty Realtime] Error sending PAUSE:", err))
  }, [userId])

  const sendSeek = useCallback(
    (currentTime: number) => {
      if (!channelRef.current || !userId) return
      console.log("[Watchparty Realtime] Sending broadcast: SEEK", { userId, currentTime })
      void channelRef.current
        .send({
          type: "broadcast",
          event: "seek",
          payload: { senderId: userId, t: Date.now(), currentTime },
        })
        .catch((err) => console.error("[Watchparty Realtime] Error sending SEEK:", err))
    },
    [userId]
  )

  const requestSync = useCallback(() => {
    if (!channelRef.current || !userId) return
    console.log("[Watchparty Realtime] Manually requesting sync from peers...")
    void channelRef.current
      .send({
        type: "broadcast",
        event: "request_sync",
        payload: { senderId: userId, t: Date.now() },
      })
      .catch(() => {})
  }, [userId])

  return useMemo(
    () => ({
      peers,
      status,
      sendPlay,
      sendPause,
      sendSeek,
      requestSync,
    }),
    [peers, status, sendPlay, sendPause, sendSeek, requestSync]
  )
}
