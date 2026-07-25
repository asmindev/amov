import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Search, X } from "lucide-react"
import type { SubtitlesSettingsSectionProps } from "./types"
import type { WyzieSubtitleGroup } from "@/api/decryptor.api"

export function SubtitlesSettingsSection({
  providerSubtitles,
  isFetchingWyzie,
  onFetchWyzie,
  selectedSub,
  setSelectedSub,
  wyzieGroups,
  subError,
  showHeading = true,
}: SubtitlesSettingsSectionProps) {
  const [search, setSearch] = useState("")
  const [expandedLangs, setExpandedLangs] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!search.trim()) return wyzieGroups
    const q = search.toLowerCase()
    return wyzieGroups.filter(
      (g) =>
        g.display.toLowerCase().includes(q) ||
        g.language.toLowerCase().includes(q)
    )
  }, [wyzieGroups, search])

  const toggleExpand = (lang: string) => {
    setExpandedLangs((prev) => {
      const next = new Set(prev)
      if (next.has(lang)) {
        next.delete(lang)
      } else {
        next.add(lang)
      }
      return next
    })
  }

  const totalWyzieSubtitles = wyzieGroups.reduce(
    (acc, g) => acc + g.subtitles.length,
    0
  )

  const hasProviderSubtitles = providerSubtitles.length > 0

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {showHeading && (
        <h3 className="text-label-md mb-4 font-label-md font-extrabold tracking-wider text-secondary uppercase">
          Subtitles
        </h3>
      )}

      {/* Fetch button for Wyzie */}
      <div className="mb-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 border-primary text-xs text-primary hover:bg-primary/20"
          onClick={onFetchWyzie}
          disabled={isFetchingWyzie}
        >
          {isFetchingWyzie ? (
            <div className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <span className="material-symbols-outlined mr-1.5 text-[14px]">
              download
            </span>
          )}
          {totalWyzieSubtitles > 0 ? "Refresh External" : "Fetch External"}
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search language..."
          className="h-8 w-full rounded-md border border-border bg-white/5 pr-7 pl-8 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Subtitle list */}
      <div className="settings-scroll min-h-0 max-h-[60vh] flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-white/[0.02] p-1">
        {/* Off button */}
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

        {/* Provider Subtitles Section */}
        {hasProviderSubtitles && (
          <div className="mt-2">
            <div className="mb-1 flex items-center gap-2 px-3 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Provider
              </span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {providerSubtitles.length}
              </span>
            </div>
            {providerSubtitles.map((sub) => {
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
                  <span className="truncate capitalize">
                    {sub.language || sub.lang}
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {isActive && subError && (
                      <span className="material-symbols-outlined text-[14px] text-red-400">
                        close
                      </span>
                    )}
                    {isActive && !subError && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Divider between provider and Wyzie */}
        {hasProviderSubtitles && filtered.length > 0 && (
          <div className="my-2 border-t border-border" />
        )}

        {/* Wyzie External Subtitles Section */}
        {filtered.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-2 px-3 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                External (Wyzie)
              </span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {totalWyzieSubtitles}
              </span>
            </div>
            {filtered.map((group) => (
              <LanguageGroup
                key={group.language}
                group={group}
                selectedSub={selectedSub}
                onSelectSub={setSelectedSub}
                isExpanded={expandedLangs.has(group.language)}
                onToggleExpand={() => toggleExpand(group.language)}
                subError={subError}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 &&
          !hasProviderSubtitles &&
          !isFetchingWyzie && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {search
                ? `No languages match "${search}"`
                : "No subtitles available. Click Fetch External to load."}
            </div>
          )}
      </div>
    </div>
  )
}

// ── Language Group Component ──────────────────────────────────────────────────

function LanguageGroup({
  group,
  selectedSub,
  onSelectSub,
  isExpanded,
  onToggleExpand,
  subError,
}: {
  group: WyzieSubtitleGroup
  selectedSub: string | null
  onSelectSub: (val: string | null) => void
  isExpanded: boolean
  onToggleExpand: () => void
  subError: boolean
}) {
  const hasSelected = group.subtitles.some((s) => s.url === selectedSub)
  const count = group.subtitles.length

  return (
    <div className="rounded-md">
      {/* Language header */}
      <button
        onClick={onToggleExpand}
        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
          hasSelected
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-2">
          {group.flagUrl && (
            <img
              src={group.flagUrl}
              alt={group.display}
              className="h-3.5 w-5 rounded-sm object-cover"
            />
          )}
          <span className="font-medium">{group.display}</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {count}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded subtitles */}
      {isExpanded && (
        <div className="ml-4 space-y-0.5 overflow-hidden border-l border-border pl-2">
          {group.subtitles.map((sub) => {
            const isActive = selectedSub === sub.url
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSub(sub.url)}
                className={`flex w-full items-center justify-between overflow-hidden rounded-md px-3 py-1.5 text-left text-[11px] transition-colors ${
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">
                    {sub.release || sub.fileName || sub.display}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                    <span className="uppercase">{sub.format}</span>
                    <span>·</span>
                    <span>{sub.encoding}</span>
                    {sub.isHearingImpaired && (
                      <>
                        <span>·</span>
                        <span className="text-primary/70">HI</span>
                      </>
                    )}
                    {sub.ai && (
                      <>
                        <span>·</span>
                        <span className="text-blue-400/70">AI</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="ml-2 flex shrink-0 items-center gap-1">
                  {isActive && subError && (
                    <span className="material-symbols-outlined text-[14px] text-red-400">
                      close
                    </span>
                  )}
                  {isActive && !subError && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
