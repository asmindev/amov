import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SUBTITLE_PROVIDERS } from "./constants"
import type { SubtitlesSettingsSectionProps } from "./types"

export function SubtitlesSettingsSection({
  selectedProvider,
  setSelectedProvider,
  isFetchingSubtitles,
  onFetchSubtitles,
  selectedSub,
  setSelectedSub,
  subtitles,
  showHeading = true,
  scrollClassName = "settings-scroll flex-1 space-y-1 overflow-y-auto",
}: SubtitlesSettingsSectionProps) {
  return (
    <>
      {showHeading && (
        <h3 className="text-label-md mb-4 font-label-md font-extrabold tracking-wider text-secondary uppercase">
          Subtitles
        </h3>
      )}

      <div className="mb-4 flex gap-2">
        <Select
          value={selectedProvider}
          onValueChange={(value) => setSelectedProvider(value ?? "opensubtitles")}
        >
          <SelectTrigger className="h-8 flex-1 border-border bg-white/5 text-xs">
            <SelectValue placeholder="Pilih Sumber" />
          </SelectTrigger>
          <SelectContent className="z-[70]">
            {SUBTITLE_PROVIDERS.map((provider) => (
              <SelectItem key={provider.value} value={provider.value}>
                {provider.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-8 border-primary px-3 text-xs text-primary hover:bg-primary/20"
          onClick={onFetchSubtitles}
          disabled={isFetchingSubtitles}
        >
          {isFetchingSubtitles ? (
            <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <span className="material-symbols-outlined mr-1 text-[14px]">
              download
            </span>
          )}
          Fetch
        </Button>
      </div>

      <div className={scrollClassName}>
        <Button
          variant="ghost"
          className={`group w-full justify-between font-body-md ${!selectedSub ? "bg-white/5" : "hover:bg-white/5"}`}
          onClick={() => setSelectedSub(null)}
        >
          <span
            className={`group-hover:text-white ${!selectedSub ? "text-foreground" : "text-muted-foreground"}`}
          >
            Off
          </span>
          {!selectedSub && (
            <span className="material-symbols-outlined text-primary">check</span>
          )}
        </Button>

        {subtitles.map((sub) => (
          <Button
            key={sub.url}
            variant="ghost"
            className={`group w-full justify-between font-body-md ${selectedSub === sub.url ? "bg-white/5" : "hover:bg-white/5"}`}
            onClick={() => setSelectedSub(sub.url)}
          >
            <span
              className={`group-hover:text-white ${selectedSub === sub.url ? "text-foreground" : "text-muted-foreground"}`}
            >
              {sub.language || sub.lang}
            </span>
            {selectedSub === sub.url && (
              <span className="material-symbols-outlined text-primary">check</span>
            )}
          </Button>
        ))}
      </div>
    </>
  )
}
