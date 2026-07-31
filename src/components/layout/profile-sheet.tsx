import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Globe, Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { loadAllProgress } from "@/hooks/use-watch-progress"
import {
  fetchWatchHistory,
  upsertWatchHistory,
  mergeWatchHistory,
} from "@/api/watch-history.api"

export function ProfileSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, role, signOut, setAuthModalOpen, syncEnabled, setSyncEnabled } =
    useAuthStore()
  const [syncing, setSyncing] = useState(false)

  const handleSyncToCloud = async () => {
    if (syncing || !user) return
    setSyncing(true)
    try {
      const localEntries = Object.values(loadAllProgress())
      const cloudEntries = await fetchWatchHistory(user.id)
      const merged = mergeWatchHistory(localEntries, cloudEntries)
      const ok = await upsertWatchHistory(user.id, merged)
      if (ok) setSyncEnabled(true)
    } finally {
      setSyncing(false)
    }
  }

  const currentLang =
    typeof window !== "undefined"
      ? localStorage.getItem("app-language") || "en-US"
      : "en-US"
  const toggleLanguage = () => {
    const nextLang = currentLang === "en-US" ? "id-ID" : "en-US"
    localStorage.setItem("app-language", nextLang)
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-auto right-0 bottom-0 left-0 w-full max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-x-0 border-b-0 sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 text-sm font-black text-white uppercase ring-2 ring-white/10">
                  {user.email?.[0] ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.email}
                  </p>
                  {role === "admin" && (
                    <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-red-500 uppercase ring-1 ring-red-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncToCloud}
                disabled={syncing}
                className={`flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  syncEnabled
                    ? "text-green-400"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Syncing...
                  </>
                ) : syncEnabled ? (
                  "Synced ✓"
                ) : (
                  "Sync to Cloud"
                )}
              </button>
              {role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => onOpenChange(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-white/10"
                >
                  Admin Analytics
                </Link>
              )}
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                setAuthModalOpen(true, "signin")
              }}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-500 active:scale-95"
            >
              Sign In
            </button>
          )}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Globe className="h-4 w-4" />
            Language: {currentLang === "en-US" ? "EN" : "ID"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
