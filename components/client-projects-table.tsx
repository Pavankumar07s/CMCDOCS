"use client"

import Link from "next/link"
import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ClientProjectsTable() {
  const projects = [
    {
      id: "1234",
      name: "Sector 7 Main Road Reconstruction",
      ward: "Ward 12 - Sector 7",
      status: "In Progress",
      startDate: "15 Mar 2024",
      completion: 65,
      budget: "₹ 1.85 Cr",
      nextMilestone: "Asphalt Paving",
      nextMilestoneDate: "May 5, 2024",
    },
    {
      id: "1235",
      name: "Ambala Cantt Bypass Extension",
      ward: "Ward 5 - Cantt",
      status: "Planning",
      startDate: "Pending",
      completion: 0,
      budget: "₹ 3.20 Cr",
      nextMilestone: "Tender Approval",
      nextMilestoneDate: "May 20, 2024",
    },
    {
      id: "1236",
      name: "Mahesh Nagar Road Resurfacing",
      ward: "Ward 8 - Mahesh Nagar",
      status: "Tendering",
      startDate: "Pending",
      completion: 0,
      budget: "₹ 0.75 Cr",
      nextMilestone: "Initial Survey",
      nextMilestoneDate: "May 10, 2024",
    },
    {
      id: "1237",
      name: "Sector 10 Internal Roads",
      ward: "Ward 3 - Sector 10",
      status: "Completed",
      startDate: "10 Jan 2024",
      completion: 100,
      budget: "₹ 1.20 Cr",
      nextMilestone: "None",
      nextMilestoneDate: "Completed",
    },
    {
      id: "1238",
      name: "Railway Road Widening",
      ward: "Ward 1 - Central",
      status: "In Progress",
      startDate: "05 Feb 2024",
      completion: 40,
      budget: "₹ 2.50 Cr",
      nextMilestone: "Base Preparation Completion",
      nextMilestoneDate: "May 15, 2024",
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Project Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <div className="flex items-center">
              Progress
              <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0">
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </div>
          </TableHead>
          <TableHead>Next Milestone</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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
              <div className="flex w-full max-w-xs items-center gap-2">
                <Progress value={project.completion} className="h-2" />
                <span className="w-12 text-xs">{project.completion}%</span>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{project.nextMilestone}</div>
                <div className="text-xs text-muted-foreground">{project.nextMilestoneDate}</div>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href={`/client/projects/${project.id}`} className="flex w-full items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Submit feedback</DropdownMenuItem>
                  <DropdownMenuItem>Download report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
