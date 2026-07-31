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
  budget?: number
  revenue?: number
  numberOfSeasons?: number
  numberOfEpisodes?: number
}

export function InfoSidebar({
  status,
  releaseDate = "",
  originalLanguage,
  budget = 0,
  revenue = 0,
  numberOfSeasons,
  numberOfEpisodes,
}: InfoSidebarProps) {
  const isTv = numberOfSeasons !== undefined || numberOfEpisodes !== undefined

  return (
    <div className="space-y-4 rounded-none border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
      <InfoRow label="Status" value={status} />
      <InfoRow
        label={isTv ? "First Air Date" : "Release Date"}
        value={formatDate(releaseDate)}
      />
      <InfoRow
        label="Original Language"
        value={originalLanguage.toUpperCase()}
        icon={<span className="material-symbols-outlined !text-[16px]">language</span>}
      />

      {isTv ? (
        <>
          {numberOfSeasons !== undefined && (
            <InfoRow
              label="Seasons"
              value={`${numberOfSeasons} Season${numberOfSeasons > 1 ? "s" : ""}`}
              icon={<span className="material-symbols-outlined !text-[16px]">layers</span>}
            />
          )}
          {numberOfEpisodes !== undefined && (
            <InfoRow
              label="Episodes"
              value={`${numberOfEpisodes} Episode${numberOfEpisodes > 1 ? "s" : ""}`}
              icon={<span className="material-symbols-outlined !text-[16px]">tv</span>}
            />
          )}
        </>
      ) : (
        <>
          <InfoRow
            label="Budget"
            value={formatMoney(budget)}
            icon={<span className="material-symbols-outlined !text-[16px]">attach_money</span>}
          />
          <InfoRow
            label="Revenue"
            value={formatMoney(revenue)}
            icon={<span className="material-symbols-outlined !text-[16px]">trending_up</span>}
          />
        </>
      )}
    </div>
  )
}
