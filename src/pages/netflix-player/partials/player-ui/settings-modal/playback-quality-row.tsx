import { Button } from "@/components/ui/button"
import type { PlaybackQualityRowProps } from "./types"

export function PlaybackQualityRow({
  sources,
  selectedQuality,
  setSelectedQuality,
}: PlaybackQualityRowProps) {
  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="text-label-md mb-4 font-label-md tracking-wider text-secondary uppercase">
        Playback Quality
      </h3>
      <div className="scrollbar-hide flex flex-wrap gap-4 overflow-x-auto pb-2">
        {sources.map((src, i) => (
          <Button
            key={src.url}
            variant={i === selectedQuality ? "default" : "outline"}
            className={`text-label-md rounded-full font-label-md whitespace-nowrap ${
              i === selectedQuality
                ? "border border-primary bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border text-muted-foreground hover:border-white hover:text-white"
            }`}
            onClick={() => setSelectedQuality(i)}
          >
            {src.quality}
            {src.size ? ` (${src.size})` : ""} {i === 0 && "(Best)"}
          </Button>
        ))}
      </div>
    </div>
  )
}
