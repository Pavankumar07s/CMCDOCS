import Link from "next/link"
import { ArrowUpRight, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientHeader } from "@/components/client-header"
import { ClientKpiCards } from "@/components/client-kpi-cards"
import { ClientProjectsTable } from "@/components/client-projects-table"
import { ClientShell } from "@/components/client-shell"
import { FeedbackForm } from "@/components/feedback-form"
import { NotificationCenter } from "@/components/notification-center"
import { ProjectTimeline } from "@/components/project-timeline"
import { UpcomingMilestones } from "@/components/upcoming-milestones"

export default function ClientDashboardPage() {
  return (
    <ClientShell>
      <ClientHeader heading="Client Dashboard" text="Overview of your road projects and maintenance activities">
        <div className="flex space-x-2">
          <NotificationCenter />
          <Link href="/client/feedback/new">
            <Button variant="outline" className="gap-1">
              <MessageSquare className="h-4 w-4" />
              Submit Feedback
            </Button>
          </Link>
        </div>
      </ClientHeader>

      <ClientKpiCards />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Timeline of your ongoing projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectTimeline />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
            <CardDescription>Milestones due in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingMilestones />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="feedback">My Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="border rounded-md">
          <ClientProjectsTable />
        </TabsContent>
        <TabsContent value="feedback" className="border rounded-md p-6">
          <FeedbackForm />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Link href="/client/reports">
          <Button variant="outline" className="gap-1">
            View Reports
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/client/map">
          <Button variant="outline" className="gap-1">
            Map View
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </ClientShell>
  )
}
