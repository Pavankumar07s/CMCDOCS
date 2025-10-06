"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MapInterface } from "@/components/map-interface"
import { AssignmentsList } from "@/components/assignments-list"
import type { Assignment, Contractor, RoadSegment } from "@/types/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminHeader } from "@/components/admin-header"
import { AdminShell } from "@/components/admin-shell"

export default function NewProjectPage() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [error, setError] = useState("")
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([])
  const [selectedRoads, setSelectedRoads] = useState<RoadSegment[]>([])
  const [existingAssignments, setExistingAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    // Fetch contractors
    fetch("/api/contractors")
      .then(res => res.json())
      .then(data => setContractors(data.contractors || []))

    // Fetch road segments
    fetch("/api/roads")
      .then(res => res.json())
      .then(data => setRoadSegments(data.roads || []))

    // Fetch existing assignments
    fetch("/api/assignments")
      .then(res => res.json())
      .then(data => setExistingAssignments(data.assignments || []))
  }, [])

  // No form handlers needed - using map interface for road assignments

  return (
    <AdminShell>
      <AdminHeader
        heading="Create New Project"
        text="Add a new road construction or maintenance project"
      >
        <Link href="/admin/projects">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </AdminHeader>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Draw and Assign Road Segments</CardTitle>
          </CardHeader>
          <CardContent>
              <MapInterface onRoadsSelect={setSelectedRoads} />
              {/* <AssignmentsList 
                refreshTrigger={refreshTrigger}
                contractors={contractors}
                selectedRoads={selectedRoads}
                existingAssignments={existingAssignments}
                onAssignmentsChange={(assignments) => {
                  setRefreshTrigger(prev => prev + 1)
                }}
              /> */}
            
          </CardContent>
        </Card>
      </div>
    </AdminShell>
          
     
  )
}