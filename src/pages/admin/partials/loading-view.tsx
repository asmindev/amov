export function LoadingView() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center pt-20">
      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <span className="material-symbols-outlined animate-spin text-red-500">
          refresh
        </span>
        <span>Verifying admin permissions...</span>
      </div>
    </div>
  )
}
