import { memo } from "react"
import { Link } from "@tanstack/react-router"
import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { WatchpartyPopover } from "../../watchparty/room-overlay"
import type { WatchpartyPopoverProps } from "../../watchparty/room-overlay"

export interface TopAppBarProps {
  mediaType: "movie" | "tv"
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
  onStartWatchparty?: () => void
  isWatchpartyActive?: boolean
  watchpartyProps?: WatchpartyPopoverProps | null
}

export const TopAppBar = memo(function TopAppBar({
  mediaType,
  movieId,
  movieTitle,
  provider,
  providerIndex,
  allProviders,
  onProviderChange,
  setOpenMenu,
  onStartWatchparty,
  isWatchpartyActive,
  watchpartyProps,
}: TopAppBarProps) {
  return (
    <div className="pointer-events-none fixed top-0 z-40 flex w-full items-center justify-between bg-linear-to-b from-black/80 to-transparent px-edge-margin-mobile py-4 md:px-edge-margin-desktop">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
        <Link
          to="/$type/$id"
          params={{ type: mediaType, id: movieId.toString() }}
          className="pointer-events-auto flex max-md:h-10 max-md:w-10 h-12 w-12 items-center justify-center text-white/80 transition-all hover:scale-110 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="material-symbols-outlined max-md:text-[24px] text-[36px] leading-none"
            style={{ fontVariationSettings: "'wght' 700" }}
          >
            arrow_back
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg leading-none font-bold tracking-wide text-white sm:max-w-md md:max-w-xl md:text-2xl lg:max-w-3xl">
          {movieTitle}
        </h1>
      </div>

      <div className="pointer-events-auto flex items-center gap-control-gap">
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <PopoverTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex max-md:h-10 max-md:w-10 h-12 w-12 scale-95 flex-col items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-white active:scale-90"
                  >
                    <span
                      className="material-symbols-outlined text-2xl md:text-3xl!"
                      data-icon="dns"
                    >
                      dns
                    </span>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Server: {provider}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="z-50 w-48 rounded-xl border border-white/15 bg-black/85 p-1 text-white shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 border-b border-white/10 px-3 py-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Select Server
            </div>
            {allProviders.map((p, i) => (
              <button
                key={p}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  i === providerIndex
                    ? "bg-primary/20 font-bold text-primary"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => {
                  onProviderChange(i)
                  setOpenMenu(null)
                }}
              >
                <span>{p}</span>
                {i === providerIndex && (
                  <span className="material-symbols-outlined text-sm text-primary">
                    check
                  </span>
                )}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {isWatchpartyActive && watchpartyProps ? (
          <WatchpartyPopover {...watchpartyProps} />
        ) : onStartWatchparty ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex max-md:h-10 max-md:w-10 h-12 w-12 scale-95 flex-col items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-white active:scale-90"
                  onClick={(e) => {
                    e.stopPropagation()
                    onStartWatchparty()
                  }}
                >
                  <span className="material-symbols-outlined text-2xl md:text-3xl!">
                    groups
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start Watchparty</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  )
})
