"use client"

import { useState } from "react"
import { Download, Filter, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientHeader } from "@/components/client-header"
import { ClientProjectsReportTable } from "@/components/client-projects-report-table"
import { ClientShell } from "@/components/client-shell"
import { ProjectProgressChart } from "@/components/project-progress-chart"

export default function ClientReportsPage() {
  const [reportType, setReportType] = useState("projects")
  const [dateRange, setDateRange] = useState("last30")
  const [projectId, setProjectId] = useState("all")

  return (
    <ClientShell>
      <ClientHeader heading="Project Reports" text="View and export reports for your road projects">
        <div className="flex space-x-2">
          <Button variant="outline" className="gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </ClientHeader>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Customize your report by applying filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">Projects Overview</SelectItem>
                  <SelectItem value="progress">Project Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="project-filter">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project-filter">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="1234">Sector 7 Main Road</SelectItem>
                  <SelectItem value="1235">Ambala Cantt Bypass</SelectItem>
                  <SelectItem value="1236">Mahesh Nagar Road</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Button className="gap-1">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportType === "projects" && (
        <Card>
          <CardHeader>
            <CardTitle>Projects Overview Report</CardTitle>
            <CardDescription>Overview of your road projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientProjectsReportTable />
          </CardContent>
        </Card>
      )}

      {reportType === "progress" && (
        <Card>
          <CardHeader>
            <CardTitle>Project Progress Report</CardTitle>
            <CardDescription>Progress analysis of your road projects over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectProgressChart projectId={projectId} />
          </CardContent>
        </Card>
      )}
    </ClientShell>
  )
}
