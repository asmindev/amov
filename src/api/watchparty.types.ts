// Shared types for the watchparty (co-watching) feature

export interface WatchpartyRoom {
  id: string
  slug: string
  tmdbId: number
  title: string
  mediaType: "movie" | "tv"
  createdBy: string | null
  createdAt: string
}

export interface CreateWatchpartyRoomParams {
  tmdbId: number
  title: string
  mediaType: "movie" | "tv"
}

export interface WatchpartyMember {
  userId: string
  email?: string
  displayName?: string
  joinedAt: number
}
