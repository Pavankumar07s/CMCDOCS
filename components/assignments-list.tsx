"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { MapPin, User, Calendar, Ruler, AlertCircle } from "lucide-react"

interface RoadSegment {
  id: number
  name: string
}

interface Contractor {
  id: number
  name: string
}

interface Assignment {
  id: number
  road_segment_name: string
  contractor_name: string
  start_date: string
  end_date: string
  status: string
  length_meters: number
  notes?: string
}

interface AssignmentsListProps {
  refreshTrigger?: number
}

// interface AssignmentsListProps {
//   contractors: Contractor[]
//   selectedRoads: RoadSegment[]
//   existingAssignments: Assignment[]
//   onAssignmentsChange: (assignments: Partial<Assignment>[]) => void
// }
interface AssignmentsListProps {
  contractors: Contractor[]
  selectedRoads: RoadSegment[]
  existingAssignments: import("@/types/prisma").Assignment[]
  onAssignmentsChange: (assignments: Partial<import("@/types/prisma").Assignment>[]) => void
}
export function AssignmentsList({ refreshTrigger }: AssignmentsListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAssignments()
  }, [refreshTrigger])

  const loadAssignments = async () => {
    try {
      const response = await fetch("/api/assignments")
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error("Failed to load assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const isCurrentlyActive = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return now >= start && now <= end
  }

  const getProjectType = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("maintenance"))
      return { type: "Maintenance", icon: "🔧", color: "bg-amber-100 text-amber-800" }
    if (lowerName.includes("construction"))
      return { type: "Construction", icon: "🏗️", color: "bg-blue-100 text-blue-800" }
    if (lowerName.includes("repair")) return { type: "Repair", icon: "⚒️", color: "bg-red-100 text-red-800" }
    return { type: "Project", icon: "🛣️", color: "bg-gray-100 text-gray-800" }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading assignments...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Road Assignments ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No assignments yet. Draw a road segment to get started.</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const projectType = getProjectType(assignment.road_segment_name)
            const isActive = isCurrentlyActive(assignment.start_date, assignment.end_date)

            return (
              <div
                key={assignment.id}
                className={`p-4 border rounded-lg space-y-3 transition-all hover:shadow-md ${isActive ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{assignment.road_segment_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${projectType.color}`}>
                        {projectType.icon} {projectType.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                    {isActive && (
                      <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                        🟢 Active Now
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>
                      <strong>Contractor:</strong> {assignment.contractor_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    <span>
                      <strong>Length:</strong> {(assignment.length_meters / 1000).toFixed(2)} km
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <strong>Duration:</strong> {new Date(assignment.start_date).toLocaleDateString()} -{" "}
                      {new Date(assignment.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {assignment.notes && (
                  <div className="p-2 bg-muted/50 rounded text-sm">
                    <strong>Notes:</strong> {assignment.notes}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    📝 Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    👁️ View Details
                  </Button>
                  {assignment.status === "active" && (
                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 bg-transparent">
                      ✅ Complete
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
