import { useCallback, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapInterface } from '@/components/map-interface'
import { AssignmentsList } from '@/components/assignments-list'
import { Button } from '@/components/ui/button'
import type { Assignment, Contractor, RoadSegment } from '@/types/prisma'

interface RoadAssignmentProps {
  contractors: Contractor[]
  roadSegments: RoadSegment[]
  existingAssignments: Assignment[]
  onAssign: (assignments: Partial<Assignment>[]) => Promise<void>
}

export function RoadAssignmentDialog({ 
  contractors, 
  roadSegments, 
  existingAssignments, 
  onAssign 
}: RoadAssignmentProps) {
  const [open, setOpen] = useState(false)
  const [selectedRoads, setSelectedRoads] = useState<RoadSegment[]>([])
  const [assignments, setAssignments] = useState<Partial<Assignment>[]>([])

  const handleAssign = useCallback(async () => {
    await onAssign(assignments)
    setOpen(false)
    setSelectedRoads([])
    setAssignments([])
  }, [assignments, onAssign])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Assign Roads</Button>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Road Assignment</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 h-[600px]">
          <MapInterface
            roadSegments={roadSegments}
            selectedRoads={selectedRoads}
            onRoadSelect={setSelectedRoads}
          />
          <AssignmentsList
            contractors={contractors}
            selectedRoads={selectedRoads}
            existingAssignments={existingAssignments}
            onAssignmentsChange={setAssignments}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={assignments.length === 0}>
            Confirm Assignments
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}