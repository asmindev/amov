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

interface VisitorLogsTableProps {
  data: AdminAnalyticsData | null
}

export function VisitorLogsTable({ data }: VisitorLogsTableProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400">
            public
          </span>
          <CardTitle>Last 10 Recent Visitor Logs</CardTitle>
        </div>
        <CardDescription>
          Live visitor breakdown: Route/Page, Device, Browser, IP Address &
          Country
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Route / Page</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Browser</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.lastVisits.length > 0 ? (
              data.lastVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="text-neutral-400">
                    {new Date(visit.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-red-400">
                    {visit.path}
                  </TableCell>
                  <TableCell>
                    <Badge className="uppercase">
                      {visit.deviceType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500/10 font-bold text-blue-400 uppercase">
                      {visit.browser}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-200">
                    {visit.country}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-neutral-400">
                    {visit.ip}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-neutral-500">
                  No visitor logs recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
