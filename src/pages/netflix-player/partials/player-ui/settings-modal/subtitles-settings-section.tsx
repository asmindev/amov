import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, Search, X } from "lucide-react"
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
}: SubtitlesSettingsSectionProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return subtitles
    const q = search.toLowerCase()
    return subtitles.filter(
      (s) =>
        (s.language || "").toLowerCase().includes(q) ||
        (s.lang || "").toLowerCase().includes(q)
    )
  }, [subtitles, search])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {showHeading && (
        <h3 className="text-label-md mb-4 font-label-md font-extrabold tracking-wider text-secondary uppercase">
          Subtitles
        </h3>
      )}

      <div className="mb-3 flex gap-2">
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

      {/* Search */}
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search language..."
          className="h-8 w-full rounded-md border border-border bg-white/5 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="settings-scroll min-h-0 flex-1 space-y-0.5 overflow-y-auto rounded-lg border border-border bg-white/[0.02] p-1">
        <button
          onClick={() => setSelectedSub(null)}
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
            !selectedSub
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          }`}
        >
          <span>Off</span>
          {!selectedSub && <Check className="h-3.5 w-3.5 text-primary" />}
        </button>

        {filtered.length === 0 && search && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No subtitles match "{search}"
          </div>
        )}

        {filtered.map((sub) => {
          const key = sub.url
          const isActive = selectedSub === key
          return (
            <button
              key={key}
              onClick={() => setSelectedSub(key)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <span className="truncate capitalize">{sub.language || sub.lang}</span>
              {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
