"use client"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeader } from "@/components/admin-header"
import { AdminShell } from "@/components/admin-shell"
import { AdminKpiCards } from "@/components/admin-kpi-cards"
import { BudgetAllocationChart } from "@/components/budget-allocation-chart"
import { NotificationCenter } from "@/components/notification-center"
import { ProjectStatusChart } from "@/components/project-status-chart"
import { RecentActivityTable } from "@/components/recent-activity-table"
import { RoadProjectsTable } from "@/components/road-projects-table"
import { SystemHealthMonitor } from "@/components/system-health-monitor"
import { UserManagementTable } from "@/components/user-management-table"
import { WardPerformanceChart } from "@/components/ward-performance-chart"
import { AddUserModal } from "@/components/add-user-modal"

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      const res = await fetch("/api/admin/dashboard")
      const data = await res.json()
      console.log("Dashboard Data of admin:", data)
      setDashboardData(data)
      setLoading(false)
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-[600px] items-center justify-center">
          <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="Admin Dashboard"
        text="Comprehensive management of road projects, tenders, and system users"
      >
        <div className="flex space-x-2">
          <NotificationCenter isAdmin />
          <Link href="/admin/projects/new">
            <Button>Add New Project</Button>
          </Link>
          <Button variant="outline" onClick={() => setShowAddUser(true)}>
            Add User
          </Button>
        </div>
      </AdminHeader>
      <AddUserModal open={showAddUser} onOpenChange={setShowAddUser} />

      <AdminKpiCards data={dashboardData.kpis} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ward Performance</CardTitle>
            <CardDescription>Project completion rates and budget utilization by ward</CardDescription>
          </CardHeader>
          <CardContent>
            <WardPerformanceChart data={dashboardData.wardPerformance} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribution of projects by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={dashboardData.projectStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>Budget allocation across wards</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetAllocationChart data={dashboardData.budgetAllocation} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <SystemHealthMonitor data={dashboardData.systemHealth} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="border rounded-md">
          <RoadProjectsTable isAdmin={true} data={dashboardData.projects} />
        </TabsContent>
        <TabsContent value="users" className="border rounded-md">
          <UserManagementTable data={dashboardData.users} />
        </TabsContent>
        <TabsContent value="activity" className="border rounded-md">
          <RecentActivityTable data={dashboardData.activities} isAdmin={true} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Link href="/admin/reports">
          <Button variant="outline" className="gap-1">
            Advanced Reports
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/admin/projects">
          <Button variant="outline" className="gap-1">
            All Projects
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="outline" className="gap-1">
            All Users
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </AdminShell>
  )
}
