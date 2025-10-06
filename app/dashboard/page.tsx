"use client"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface DashboardData {
  metrics: {
    activeProjects: number
    totalLength: number
    completionRate: number
    wardsCovered: number
  }
  projectStatus: Array<{
    name: string
    value: number
  }>
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
  }
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { BudgetAllocationChart } from "@/components/budget-allocation-chart"
import { ProjectStatusChart } from "@/components/project-status-chart"
import { RecentActivityTable } from "@/components/recent-activity-table"
import { RoadProjectsTable } from "@/components/road-projects-table"
import { SystemHealthMonitor } from "@/components/system-health-monitor"
import { WardPerformanceChart } from "@/components/ward-performance-chart"

export default function ContractorDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const res = await fetch("/api/contractor/dashboard")
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        const data = await res.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setDashboardData(data)
      } catch (error) {
        console.error("Dashboard error:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[600px] items-center justify-center">
          <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Contractor Dashboard"
        text="Overview of your assigned projects and performance"
      >
        <Link href="/projects">
          <Button>All Projects</Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics?.activeProjects || 0}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics?.totalLength || 0} km</div>
            <p className="text-xs text-muted-foreground">Of assigned roads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Average across projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wards Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics?.wardsCovered || 0}</div>
            <p className="text-xs text-muted-foreground">Working locations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of your projects by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={dashboardData.projectStatus} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <SystemHealthMonitor data={dashboardData.systemHealth} />
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ward Performance</CardTitle>
            <CardDescription>Project progress by ward</CardDescription>
          </CardHeader>
          <CardContent>
            <WardPerformanceChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>Budget distribution across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetAllocationChart data={dashboardData?.budgetAllocation || []} />
          </CardContent>
        </Card>
      </div> */}

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="border rounded-md">
          <RoadProjectsTable isAdmin={false} />
        </TabsContent>
        <TabsContent value="activity" className="border rounded-md">
          <RecentActivityTable />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

