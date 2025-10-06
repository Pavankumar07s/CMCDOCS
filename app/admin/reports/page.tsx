"use client"

import { useState } from "react"
import { Download, Filter, Printer, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeader } from "@/components/admin-header"
import { AdminShell } from "@/components/admin-shell"
import { BudgetReportChart } from "@/components/budget-report-chart"
import { CompletionRateChart } from "@/components/completion-rate-chart"
import { ProjectsReportTable } from "@/components/projects-report-table"
import { ReportScheduler } from "@/components/report-scheduler"
import { WardComparisonChart } from "@/components/ward-comparison-chart"

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("projects")
  const [dateRange, setDateRange] = useState("last30")
  const [ward, setWard] = useState("all")
  const [status, setStatus] = useState("all")

  return (
    <AdminShell>
      <AdminHeader heading="Advanced Reports" text="Generate and schedule customized reports for road projects">
        <div className="flex space-x-2">
          <Button variant="outline" className="gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-1">
            <Save className="h-4 w-4" />
            Save Report
          </Button>
        </div>
      </AdminHeader>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Customize your report by applying filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">Projects Overview</SelectItem>
                  <SelectItem value="budget">Budget Analysis</SelectItem>
                  <SelectItem value="completion">Completion Rates</SelectItem>
                  <SelectItem value="ward">Ward Comparison</SelectItem>
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
              <Label htmlFor="ward-filter">Ward</Label>
              <Select value={ward} onValueChange={setWard}>
                <SelectTrigger id="ward-filter">
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  <SelectItem value="1">Ward 1</SelectItem>
                  <SelectItem value="2">Ward 2</SelectItem>
                  <SelectItem value="3">Ward 3</SelectItem>
                  <SelectItem value="4">Ward 4</SelectItem>
                  <SelectItem value="5">Ward 5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="tendering">Tendering</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4">
              <Button className="gap-1">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="report">
        <TabsList>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Report</TabsTrigger>
        </TabsList>
        <TabsContent value="report" className="space-y-4">
          {reportType === "projects" && (
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview Report</CardTitle>
                <CardDescription>Comprehensive overview of all road projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectsReportTable />
              </CardContent>
            </Card>
          )}

          {reportType === "budget" && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Analysis Report</CardTitle>
                <CardDescription>Analysis of budget allocation and utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetReportChart />
              </CardContent>
            </Card>
          )}

          {reportType === "completion" && (
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Report</CardTitle>
                <CardDescription>Analysis of project completion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CompletionRateChart />
              </CardContent>
            </Card>
          )}

          {reportType === "ward" && (
            <Card>
              <CardHeader>
                <CardTitle>Ward Comparison Report</CardTitle>
                <CardDescription>Comparative analysis of projects across different wards</CardDescription>
              </CardHeader>
              <CardContent>
                <WardComparisonChart />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Report</CardTitle>
              <CardDescription>Set up automated report generation and delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportScheduler />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminShell>
  )
}
