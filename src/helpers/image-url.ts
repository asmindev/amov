import { env } from "@/lib/env"

export function getImageUrl(
  path: string | null,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) return "/placeholder-poster.png"
  return `${env.VITE_IMAGE_BASE_URL}/${size}${path}`
}

export function getBackdropUrl(
  path: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "w1280"
): string {
  if (!path) return "/placeholder-backdrop.png"
  return `${env.VITE_IMAGE_BASE_URL}/${size}${path}`
}
