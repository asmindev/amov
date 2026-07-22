import { formatYear } from "./format-date"

/**
 * Dynamically determines video quality label (4K, UHD, HDR, HD)
 * based on TMDB movie popularity and release year.
 */
export function getMovieQuality(
  popularity = 0,
  releaseDate = ""
): "4K" | "UHD" | "HDR" | "HD" {
  const yearStr = formatYear(releaseDate)
  const year = parseInt(yearStr, 10) || 0

  if (popularity > 1000 && year >= 2021) {
    return "4K"
  }
  if (popularity > 500 && year >= 2018) {
    return "UHD"
  }
  if (popularity > 200 && year >= 2015) {
    return "HDR"
  }
  return "HD"
}
