import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/auth-store"
import type {
  CreateWatchpartyRoomParams,
  WatchpartyRoom,
} from "./watchparty.types"

const TABLE = "watchparty_rooms"

interface WatchpartyRoomRow {
  id: string
  slug: string
  tmdb_id: number
  title: string
  media_type: "movie" | "tv"
  created_by: string | null
  created_at: string
}

function rowToRoom(row: WatchpartyRoomRow): WatchpartyRoom {
  return {
    id: row.id,
    slug: row.slug,
    tmdbId: row.tmdb_id,
    title: row.title,
    mediaType: row.media_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function makeSlug(seed: string): string {
  const base =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "watch"
  const rand = Math.random().toString(36).slice(2, 7)
  return `${base}-${rand}`
}

export async function createWatchpartyRoom(
  params: CreateWatchpartyRoomParams
): Promise<WatchpartyRoom | null> {
  if (!supabase) return null

  const user = useAuthStore.getState().user

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      slug: makeSlug(params.title),
      tmdb_id: params.tmdbId,
      title: params.title,
      media_type: params.mediaType,
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error || !data) {
    console.error("Failed to create watchparty room:", error?.message)
    return null
  }

  return rowToRoom(data as WatchpartyRoomRow)
}

export async function getWatchpartyRoom(
  slug: string
): Promise<WatchpartyRoom | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !data) {
    console.error("Failed to fetch watchparty room:", error?.message)
    return null
  }

  return rowToRoom(data as WatchpartyRoomRow)
}
