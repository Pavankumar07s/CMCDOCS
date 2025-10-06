"use client"

import { CheckCircle, Circle, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function ProjectTimeline() {
  const timelineItems = [
    {
      id: "1",
      project: "Sector 7 Main Road",
      milestone: "Road Base Preparation",
      date: "April 22, 2024",
      status: "completed",
      description: "Base material laid and compaction completed",
    },
    {
      id: "2",
      project: "Railway Road Widening",
      milestone: "Drainage System Installation",
      date: "April 18, 2024",
      status: "completed",
      description: "Drainage pipes installed and tested",
    },
    {
      id: "3",
      project: "Sector 7 Main Road",
      milestone: "Asphalt Paving",
      date: "May 5, 2024",
      status: "upcoming",
      description: "Scheduled asphalt laying and compaction",
    },
    {
      id: "4",
      project: "Mahesh Nagar Road",
      milestone: "Initial Survey",
      date: "May 10, 2024",
      status: "upcoming",
      description: "Site survey and measurements",
    },
    {
      id: "5",
      project: "Railway Road Widening",
      milestone: "Road Base Preparation",
      date: "Current",
      status: "in-progress",
      description: "Grading and base material preparation in progress",
    },
  ]

  return (
    <div className="relative space-y-4 p-1">
      <div className="absolute left-3.5 top-0 h-full w-px bg-border" />

      {timelineItems.map((item) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="absolute left-3.5 top-3.5 -ml-1.5 h-3 w-3 rounded-full border border-background">
            {item.status === "completed" ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : item.status === "in-progress" ? (
              <Clock className="h-3 w-3 text-blue-500" />
            ) : (
              <Circle className="h-3 w-3 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 rounded-md border p-3 pl-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{item.project}</h4>
              <Badge
                variant={
                  item.status === "completed" ? "success" : item.status === "in-progress" ? "default" : "secondary"
                }
                className="text-xs"
              >
                {item.status === "completed" ? "Completed" : item.status === "in-progress" ? "In Progress" : "Upcoming"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{item.milestone}</p>
            <p className="mt-1 text-xs">{item.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
