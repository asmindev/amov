interface InfoRowProps {
  label: string
  value: string
  icon?: React.ReactNode
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm text-white/50">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-white/90">
        {value}
      </span>
    </div>
  )
}
