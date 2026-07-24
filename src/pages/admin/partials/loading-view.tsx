import { RefreshCw } from "lucide-react"

export function LoadingView() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center pt-20">
      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <RefreshCw className="h-5 w-5 animate-spin text-red-500" />
        <span>Verifying admin permissions...</span>
      </div>
    </div>
  )
}
