"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, CheckCircle, Circle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Milestone {
  id: string
  name: string
  description: string | null
  status: string
  date: string | null
  checklist: {
    id: string
    name: string
    checked: boolean
  }[]
  createdAt: string
  updatedAt: string
}

interface ProjectMilestonesProps {
  projectId: string
}

export function ProjectMilestones({ projectId }: ProjectMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMilestones()
  }, [projectId])

  const fetchMilestones = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`)
      if (!response.ok) throw new Error("Failed to fetch milestones")
      const data = await response.json()
      setMilestones(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading milestones")
      toast.error("Failed to load milestones")
    } finally {
      setLoading(false)
    }
  }

  const getCompletionPercentage = (milestone: Milestone) => {
    if (!milestone.checklist.length) return 0
    const completed = milestone.checklist.filter(item => item.checked).length
    return Math.round((completed / milestone.checklist.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchMilestones}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Project Milestones</h3>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="flex h-[200px] flex-col items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">No milestones added yet</p>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{milestone.name}</CardTitle>
                    {milestone.description && (
                      <CardDescription>{milestone.description}</CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={
                      milestone.status === "completed"
                        ? "success"
                        : milestone.status === "in_progress"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {milestone.status === "completed"
                      ? "Completed"
                      : milestone.status === "in_progress"
                      ? "In Progress"
                      : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {milestone.date
                          ? new Date(milestone.date).toLocaleDateString()
                          : "No date set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Completion:</span>
                      <span className="font-medium">{getCompletionPercentage(milestone)}%</span>
                    </div>
                  </div>
                  <Progress value={getCompletionPercentage(milestone)} className="h-2" />
                  <Separator />
                  <div className="space-y-2">
                    {milestone.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        {item.checked ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={item.checked ? "line-through text-muted-foreground" : ""}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}