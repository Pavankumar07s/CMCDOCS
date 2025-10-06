import { Calendar, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function UpcomingMilestones() {
  const milestones = [
    {
      id: "1",
      project: "Sector 7 Main Road",
      milestone: "Asphalt Paving",
      dueDate: "May 5, 2024",
      daysLeft: 3,
      status: "upcoming",
    },
    {
      id: "2",
      project: "Mahesh Nagar Road",
      milestone: "Initial Survey",
      dueDate: "May 10, 2024",
      daysLeft: 8,
      status: "upcoming",
    },
    {
      id: "3",
      project: "Railway Road Widening",
      milestone: "Base Preparation Completion",
      dueDate: "May 15, 2024",
      daysLeft: 13,
      status: "in-progress",
    },
    {
      id: "4",
      project: "Ambala Cantt Bypass",
      milestone: "Tender Approval",
      dueDate: "May 20, 2024",
      daysLeft: 18,
      status: "pending",
    },
  ]

  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <div key={milestone.id}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium">{milestone.project}</h4>
              <p className="text-xs text-muted-foreground">{milestone.milestone}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{milestone.dueDate}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge
                variant={milestone.daysLeft <= 5 ? "destructive" : milestone.daysLeft <= 10 ? "default" : "outline"}
                className="text-xs"
              >
                {milestone.daysLeft} days left
              </Badge>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {milestone.status === "in-progress"
                    ? "In Progress"
                    : milestone.status === "upcoming"
                      ? "Upcoming"
                      : "Pending"}
                </span>
              </div>
            </div>
          </div>
          {index < milestones.length - 1 && <Separator className="mt-3" />}
        </div>
      ))}
    </div>
  )
}
