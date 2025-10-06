import { FileText, MapPin, RouteIcon as Road, Users } from "lucide-react"
import useSWR from "swr"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AdminKpiCards() {
  const { data, isLoading } = useSWR("/api/admin/kpis", fetcher, {
    refreshInterval: 10000,
  })
  const kpis = data?.kpis || {}

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Road className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : kpis.totalProjects ?? 0}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {kpis.projectsChangeText || ""}
            </p>
            <p className="text-xs font-medium text-green-600">
              {kpis.projectsChangePercent || ""}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tenders</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : kpis.activeTenders ?? 0}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {kpis.tendersChangeText || ""}
            </p>
            <p className="text-xs font-medium text-green-600">
              {kpis.tendersChangePercent || ""}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : kpis.totalUsers ?? 0}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {kpis.usersChangeText || ""}
            </p>
            <p className="text-xs font-medium text-green-600">
              {kpis.usersChangePercent || ""}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wards Covered</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : kpis.wardsCovered ?? 0}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {kpis.wardsChangeText || ""}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {kpis.wardsChangePercent || ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
