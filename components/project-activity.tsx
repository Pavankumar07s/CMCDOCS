"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  action: string
  details: string | null
  createdAt: string
  user: {
    name: string
    role: string
  }
  milestone?: {
    name: string
  }
}

interface ProjectActivityProps {
  projectId: string
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchActivities()
  }, [projectId])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activities`)
      if (!response.ok) throw new Error("Failed to fetch activities")
      const data = await response.json()
      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading activities")
      toast.error("Failed to load activities")
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "MILESTONE_COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "STATUS_UPDATED":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "APPROVAL_REQUIRED":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
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
        <Button variant="outline" size="sm" onClick={fetchActivities}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="flex items-start gap-4 p-4">
            <div className="mt-1">{getActivityIcon(activity.action)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.details}</p>
                <Badge variant="secondary" className="text-xs">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              {activity.milestone && (
                <p className="text-sm text-muted-foreground">
                  Milestone: {activity.milestone.name}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                By {activity.user.name} ({activity.user.role})
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}