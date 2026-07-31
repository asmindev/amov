import { useState, type FormEvent } from "react"
import { useAuthStore } from "@/stores/auth-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    signInWithEmail,
    signUpWithEmail,
    isLoading,
  } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password")
      return
    }

    if (authMode === "signin") {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        setErrorMessage(error.message)
      }
    } else {
      const { error } = await signUpWithEmail(email, password)
      if (error) {
        setErrorMessage(error.message)
      } else {
        setSuccessMessage(
          "Account created successfully! Check your email to confirm registration."
        )
      }
    }
  }

  return (
    <Dialog
      open={isAuthModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          setErrorMessage(null)
          setSuccessMessage(null)
        }
        setAuthModalOpen(open)
      }}
    >
      <DialogContent className="border-white/10 bg-neutral-950 p-6 text-white shadow-2xl backdrop-blur-2xl sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/20 text-red-500 ring-1 ring-red-500/30">
            <span className="material-symbols-outlined !text-[24px] ">movie</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            {authMode === "signin"
              ? "Welcome back to AMOV"
              : "Create your AMOV Account"}
          </DialogTitle>
          <p className="text-xs text-neutral-400">
            {authMode === "signin"
              ? "Sign in to access your Watchlist & custom settings"
              : "Sign up to sync your Watchlist across all devices"}
          </p>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="mt-2 flex rounded-lg bg-neutral-900/80 p-1 ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null)
              setSuccessMessage(null)
              setAuthMode("signin")
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              authMode === "signin"
                ? "bg-red-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null)
              setSuccessMessage(null)
              setAuthMode("signup")
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              authMode === "signup"
                ? "bg-red-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <span className="material-symbols-outlined !text-[16px] shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
            <span className="material-symbols-outlined !text-[16px] shrink-0">error</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined !text-[16px] absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-white/10 bg-neutral-900/90 py-2 pr-3 pl-9 text-base text-white placeholder-neutral-500 transition-colors focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined !text-[16px] absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500">lock</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-neutral-900/90 py-2 pr-3 pl-9 text-base text-white placeholder-neutral-500 transition-colors focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-red-600 py-2.5 font-semibold text-white transition-colors hover:bg-red-500 active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="material-symbols-outlined !text-[16px] animate-spin">progress_activity</span>
            ) : authMode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
