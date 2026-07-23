import { Link } from "@tanstack/react-router"
import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"

export interface TopAppBarProps {
  movieId: number
  movieTitle: string
  provider: string
  providerIndex: number
  allProviders: readonly string[]
  onProviderChange: (index: number) => void
  openMenu: string | null
  setOpenMenu: Dispatch<
    SetStateAction<"settings" | "provider" | "episodes" | null>
  >
}

export function TopAppBar({
  movieId,
  movieTitle,
  provider,
  providerIndex,
  allProviders,
  onProviderChange,
  openMenu,
  setOpenMenu,
}: TopAppBarProps) {
  return (
    <div className="pointer-events-none fixed top-0 z-40 flex w-full items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-edge-margin-mobile py-4 md:px-edge-margin-desktop">
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/movie/$id"
          params={{ id: movieId.toString() }}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center text-white/80 transition-all hover:scale-110 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="material-symbols-outlined leading-none"
            style={{ fontSize: "36px", fontVariationSettings: "'wght' 700" }}
          >
            arrow_back
          </span>
        </Link>
        <h1 className="max-w-xs truncate text-xl leading-none font-bold tracking-wide text-white sm:max-w-md md:max-w-xl md:text-2xl lg:max-w-3xl">
          {movieTitle}
        </h1>
      </div>

      <div className="pointer-events-auto flex items-center gap-control-gap">
        <div className="group/server relative">
          <Button
            variant="ghost"
            size="icon"
            className="flex h-12 w-12 scale-95 flex-col items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-white active:scale-90"
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenu(openMenu === "provider" ? null : "provider")
            }}
          >
            <span
              className="material-symbols-outlined"
              data-icon="dns"
              style={{ fontSize: "28px" }}
            >
              dns
            </span>
            <span className="text-label-sm pointer-events-none absolute -bottom-8 rounded bg-popover px-2 py-1 font-label-sm whitespace-nowrap text-popover-foreground opacity-0 transition-opacity group-hover/server:opacity-100">
              Server: {provider}
            </span>
          </Button>
          {openMenu === "provider" && (
            <div className="absolute top-full right-0 z-50 mt-4 min-w-[200px] overflow-hidden rounded-xl border border-border bg-popover/90 text-popover-foreground shadow-2xl backdrop-blur-xl">
              {allProviders.map((p, i) => (
                <Button
                  key={p}
                  variant="ghost"
                  className={`h-auto w-full justify-between rounded-none px-5 py-3 font-body-md text-sm ${
                    i === providerIndex
                      ? "bg-white/5 font-bold text-white hover:bg-white/10"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onProviderChange(i)
                    setOpenMenu(null)
                  }}
                >
                  {p}
                  {i === providerIndex && (
                    <span className="material-symbols-outlined text-lg text-primary">
                      check
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
