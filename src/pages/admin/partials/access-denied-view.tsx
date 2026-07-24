import { Link } from "@tanstack/react-router"
import { ShieldAlert } from "lucide-react"

export function AccessDeniedView() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-6 text-center pt-24">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Access Restricted
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">
        You do not have administrative privileges to view the Analytics
        Dashboard. Only users with the{" "}
        <span className="font-semibold text-red-400">Admin</span> role can access
        this page.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-red-500 active:scale-95"
      >
        Return to Home Page
      </Link>
    </div>
  )
}
