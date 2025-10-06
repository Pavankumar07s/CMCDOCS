"use client"

import { Download, FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ClientProjectsReportTable() {
  const projects = [
    {
      id: "1234",
      name: "Sector 7 Main Road Reconstruction",
      ward: "Ward 12 - Sector 7",
      status: "In Progress",
      startDate: "15 Mar 2024",
      expectedCompletion: "30 Jun 2024",
      completion: 65,
      budget: "₹ 1.85 Cr",
      spent: "₹ 1.20 Cr",
      budgetUtilization: 65,
    },
    {
      id: "1235",
      name: "Ambala Cantt Bypass Extension",
      ward: "Ward 5 - Cantt",
      status: "Planning",
      startDate: "Pending",
      expectedCompletion: "TBD",
      completion: 0,
      budget: "₹ 3.20 Cr",
      spent: "₹ 0.00 Cr",
      budgetUtilization: 0,
    },
    {
      id: "1236",
      name: "Mahesh Nagar Road Resurfacing",
      ward: "Ward 8 - Mahesh Nagar",
      status: "Tendering",
      startDate: "Pending",
      expectedCompletion: "TBD",
      completion: 0,
      budget: "₹ 0.75 Cr",
      spent: "₹ 0.00 Cr",
      budgetUtilization: 0,
    },
    {
      id: "1237",
      name: "Sector 10 Internal Roads",
      ward: "Ward 3 - Sector 10",
      status: "Completed",
      startDate: "10 Jan 2024",
      expectedCompletion: "15 Mar 2024",
      completion: 100,
      budget: "₹ 1.20 Cr",
      spent: "₹ 1.18 Cr",
      budgetUtilization: 98,
    },
    {
      id: "1238",
      name: "Railway Road Widening",
      ward: "Ward 1 - Central",
      status: "In Progress",
      startDate: "05 Feb 2024",
      expectedCompletion: "20 May 2024",
      completion: 40,
      budget: "₹ 2.50 Cr",
      spent: "₹ 1.00 Cr",
      budgetUtilization: 40,
    },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-medium">Projects Overview Report</h3>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Report</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">AMB-{project.id}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-xs text-muted-foreground">{project.ward}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    project.status === "Completed"
                      ? "success"
                      : project.status === "In Progress"
                        ? "default"
                        : project.status === "Planning"
                          ? "outline"
                          : "secondary"
                  }
                >
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <div>Start: {project.startDate}</div>
                  <div>End: {project.expectedCompletion}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex w-full max-w-xs items-center gap-2">
                  <Progress value={project.completion} className="h-2" />
                  <span className="w-12 text-xs">{project.completion}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <div>Total: {project.budget}</div>
                  <div>Spent: {project.spent}</div>
                  <div className="flex items-center gap-2">
                    <Progress value={project.budgetUtilization} className="h-1 w-16" />
                    <span>{project.budgetUtilization}%</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:inline-flex">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
