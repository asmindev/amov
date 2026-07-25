import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { StreamSource } from "@/api/decryptor.api"

interface QualityPopoverProps {
  sources: StreamSource[]
  selectedQuality: number
  setSelectedQuality: (q: number) => void
}

export function QualityPopover({
  sources,
  selectedQuality,
  setSelectedQuality,
}: QualityPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="group/btn relative flex h-10 w-10 scale-95 flex-col items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 active:scale-90 text-secondary hover:text-white"
          />
        }
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "36px" }}
        >
          high_quality
        </span>
        <span className="text-label-sm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] opacity-0 transition-opacity group-hover/btn:opacity-100">
          Quality
        </span>
        {selectedQuality !== 0 && (
          <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary-container" />
        )}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={12}
        align="center"
        className="w-auto min-w-48 border-border/50 bg-[#1a1a1a]/95 backdrop-blur-md"
      >
        <p className="text-label-sm mb-2 font-label-sm tracking-wider text-secondary uppercase">
          Playback Quality
        </p>
        <div className="flex flex-col gap-1">
          {sources.map((src, i) => (
            <Button
              key={src.url}
              variant="ghost"
              className={`justify-between rounded-lg px-3 py-2 text-sm font-normal transition-colors ${
                i === selectedQuality
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setSelectedQuality(i)}
            >
              <span>
                {src.quality}
                {src.size ? ` (${src.size})` : ""}
              </span>
              {i === 0 && (
                <span className="ml-2 text-xs text-secondary">Best</span>
              )}
              {i === selectedQuality && (
                <span className="material-symbols-outlined ml-2 !text-[18px]">
                  check
                </span>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
