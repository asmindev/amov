import { UserCheck } from "lucide-react"
import type { AdminAnalyticsData } from "../types/admin.types"

interface WatchActivityTableProps {
  data: AdminAnalyticsData | null
}

export function WatchActivityTable({ data }: WatchActivityTableProps) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
        <UserCheck className="h-5 w-5 text-red-500" />
        Logged-In User Watch Activity Log
      </h2>
      <p className="mt-1 text-xs text-neutral-400">
        Real-time log of what logged-in users are watching
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 text-neutral-400">
            <tr>
              <th className="px-3 py-2 font-semibold">User Email</th>
              <th className="px-3 py-2 font-semibold">Watched Title</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-neutral-300">
            {data && data.userWatchActivity.length > 0 ? (
              data.userWatchActivity.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="px-3 py-2.5 font-semibold text-white">
                    {log.userEmail}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-red-400">
                    {log.mediaTitle}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-neutral-300 uppercase">
                      {log.mediaType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-400">
                    {new Date(log.timestamp).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-neutral-500"
                >
                  No logged-in user watch activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
