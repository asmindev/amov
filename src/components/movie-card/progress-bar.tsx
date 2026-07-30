export function ThinProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/20">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}

export function LabeledProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2 px-3 pb-1">
      <div className="h-1.5 flex-1 rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-primary">
        {Math.round(progress)}%
      </span>
    </div>
  )
}
