import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import type { AdminAnalyticsData } from "../types/admin.types"

interface WatchActivityTableProps {
  data: AdminAnalyticsData | null
}

export function WatchActivityTable({ data }: WatchActivityTableProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500">
            person_check
          </span>
          <CardTitle>Logged-In User Watch Activity Log</CardTitle>
        </div>
        <CardDescription>
          Real-time log of what logged-in users are watching
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Email</TableHead>
              <TableHead>Watched Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.userWatchActivity.length > 0 ? (
              data.userWatchActivity.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-semibold text-white">
                    {log.userEmail}
                  </TableCell>
                  <TableCell className="font-medium text-red-400">
                    {log.mediaTitle}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="uppercase">
                      {log.mediaType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-400">
                    {new Date(log.timestamp).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-neutral-500">
                  No logged-in user watch activity recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
