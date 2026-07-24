import { Globe } from "lucide-react"
import type { AdminAnalyticsData } from "../types/admin.types"

interface VisitorLogsTableProps {
  data: AdminAnalyticsData | null
}

export function VisitorLogsTable({ data }: VisitorLogsTableProps) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
        <Globe className="h-5 w-5 text-blue-400" />
        Last 10 Recent Visitor Logs
      </h2>
      <p className="mt-1 text-xs text-neutral-400">
        Live visitor breakdown: Route/Page, Device, Browser, IP Address &
        Country
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-semibold">Time</th>
              <th className="px-3 py-2 font-semibold">Route / Page</th>
              <th className="px-3 py-2 font-semibold">Device</th>
              <th className="px-3 py-2 font-semibold">Browser</th>
              <th className="px-3 py-2 font-semibold">Country</th>
              <th className="px-3 py-2 font-semibold">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-neutral-300">
            {data && data.lastVisits.length > 0 ? (
              data.lastVisits.map((visit) => (
                <tr
                  key={visit.id}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="px-3 py-2.5 text-neutral-400">
                    {new Date(visit.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-red-400">
                    {visit.path}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      {visit.deviceType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase">
                      {visit.browser}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-neutral-200">
                    {visit.country}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-neutral-400">
                    {visit.ip}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-neutral-500"
                >
                  No visitor logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
