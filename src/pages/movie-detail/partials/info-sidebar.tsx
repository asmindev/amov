import { Globe, DollarSign, TrendingUp } from "lucide-react"
import { InfoRow } from "./info-row"
import { formatDate } from "@/helpers/format-date"

function formatMoney(amount: number): string {
  if (!amount) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

interface InfoSidebarProps {
  status: string
  releaseDate?: string
  originalLanguage: string
  budget: number
  revenue: number
}

export function InfoSidebar({
  status,
  releaseDate = "",
  originalLanguage,
  budget,
  revenue,
}: InfoSidebarProps) {
  return (
    <div className="space-y-4 rounded-none border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
      <InfoRow label="Status" value={status} />
      <InfoRow label="Release Date" value={formatDate(releaseDate)} />
      <InfoRow
        label="Original Language"
        value={originalLanguage.toUpperCase()}
        icon={<Globe className="h-4 w-4" />}
      />
      <InfoRow
        label="Budget"
        value={formatMoney(budget)}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <InfoRow
        label="Revenue"
        value={formatMoney(revenue)}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  )
}
