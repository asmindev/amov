import { memo } from "react"
import { Link } from "@tanstack/react-router"
import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
}

export const TopAppBar = memo(function TopAppBar({
  mediaType,
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
        <div className="group/server relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<span />}>
                <DropdownMenu
                  open={openMenu === "provider"}
                  onOpenChange={(open) => setOpenMenu(open ? "provider" : null)}
                >
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex max-md:h-10 max-md:w-10 h-12 w-12 scale-95 flex-col items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-white active:scale-90"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="material-symbols-outlined text-2xl md:text-4xl!"
                          data-icon="dns"
                        >
                          dns
                        </span>
                      </Button>
                    }
                  />
                    <DropdownMenuPortal>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="z-1000 w-[min(220px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border/60 bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-xl"
              >
                {allProviders.map((p, i) => (
                  <DropdownMenuItem
                    key={p}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm ${
                      i === providerIndex
                        ? "bg-white/5 font-bold text-white focus:bg-white/10"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onProviderChange(i)
                      setOpenMenu(null)
                    }}
                  >
                    <span>{p}</span>
                    {i === providerIndex && (
                      <span className="material-symbols-outlined text-lg text-primary">
                        check
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </TooltipTrigger>
      <TooltipContent>Server: {provider}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
        </div>
      </div>
    </div>
  )
})
