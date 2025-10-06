"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProjectDetailsDialog } from "@/components/project-details-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ConflictWarning } from "@/components/conflict-warning"

export interface LatLng {
  lat: number
  lng: number
}

export interface DrawnSegment {
  id: string
  path: LatLng[]
  isSnapped: boolean
  snappedPath?: LatLng[]
  startPoint?: LatLng
  endPoint?: LatLng
  length?: number
  groupId?: string
  isMultiSegment?: boolean
  disconnectedPaths?: LatLng[][]
}
interface Contractor {
  id: number
  name: string
  email: string
}

interface Conflict {
  id: number
  road_segment_name: string
  contractor_name: string
  start_date: string
  end_date: string
  overlap_length_meters: number
}

interface AssignmentDialogProps {
  children: React.ReactNode
  segment: DrawnSegment
  onAssignmentCreated: () => void
  disabled?: boolean
}

export function AssignmentDialog({ children, segment, onAssignmentCreated, disabled }: AssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingConflicts, setCheckingConflicts] = useState(false)
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [isChecking, setIsChecking] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [projectDetails, setProjectDetails] = useState(null)
  interface Ward {
    id: string;
    name: string;
    number: number;
  }

  const [wards, setWards] = useState<Ward[]>([])
  const [formData, setFormData] = useState({
    // Project details
    projectName: "",
    tenderId: `TND-${Date.now()}`,
    projectType: "new",
    budget: "",
    wardId: "",
    description: "",
    // Assignment details
    roadSegmentName: "",
    contractorId: "",
    startDate: "",
    endDate: "",
    expectedCompletion: "",
    notes: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load wards first
        const wardsRes = await fetch("/api/wards")
        if (!wardsRes.ok) throw new Error('Failed to fetch wards')
        const wardsData = await wardsRes.json()
        setWards(Array.isArray(wardsData) ? wardsData : [])

        // Then load contractors
        const contractorsRes = await fetch("/api/contractors")
        if (!contractorsRes.ok) throw new Error('Failed to fetch contractors')
        const contractorsData = await contractorsRes.json()
        setContractors(Array.isArray(contractorsData) ? contractorsData : [])
      } catch (error) {
        console.error("Data loading error:", error)
        toast({
          title: "Error",
          description: "Failed to load required data. Please refresh the page.",
          variant: "destructive"
        })
        // Initialize with empty arrays on error
        setWards([])
        setContractors([])
      }
    }

    if (open) {
      loadData()
    }
  }, [toast, open])

  useEffect(() => {
    if (open) {
      // Set default name based on segment
      setFormData((prev) => ({
        ...prev,
        roadSegmentName: `Road Segment ${new Date().toISOString().split("T")[0]}`,
      }))
    }
  }, [open])

  // Check for conflicts when dates change
  useEffect(() => {
    // Check if we have either disconnected paths or a single snapped path
    const hasValidPaths = Boolean(segment.disconnectedPaths?.length) || Boolean(segment.snappedPath);
    if (formData.startDate && formData.endDate && hasValidPaths) {
      checkConflicts()
    }
  }, [formData.startDate, formData.endDate, segment.disconnectedPaths, segment.snappedPath])

  const checkConflicts = async () => {
    // Handle both single segments and grouped segments
    const paths = segment.disconnectedPaths || (segment.snappedPath ? [segment.snappedPath] : null);
    if (!paths || !formData.startDate || !formData.endDate) return;

    setCheckingConflicts(true)
    try {
      const response = await fetch("/api/assignments/check-conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: paths,
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConflicts(data.conflicts || [])
      }
    } catch (error) {
      console.error("Failed to check conflicts:", error)
    } finally {
      setCheckingConflicts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (conflicts.length > 0) {
      toast({
        title: "Cannot Create Assignment",
        description: "Please resolve conflicts before creating the assignment",
        variant: "destructive"
      });
      return;
    }

    // For grouped segments, we want to keep segments disconnected
    let validPaths;
    if (segment.disconnectedPaths) {
      // If we have disconnected paths, use them directly
      validPaths = segment.disconnectedPaths.filter(path => path.length > 0);
    } else {
      // For single segments, wrap in array
      const singlePath = segment.snappedPath || (segment.isSnapped ? segment.path : null);
      if (!singlePath || !Array.isArray(singlePath)) {
        toast({
          title: "Error",
          description: "Please wait for the road segment to be snapped to roads first.",
          variant: "destructive",
          className: "bg-white text-red-600 border-red-400"
        })
        return;
      }
      validPaths = [singlePath];
    }

    if (validPaths.length === 0) {
      toast({
        title: "Error",
        description: "No valid segments found.",
        variant: "destructive",
        className: "bg-white text-red-600 border-red-400"
      })
      return;
    }

    // Prevent submission if there are conflicts
    if (conflicts.length > 0) {
      toast({
        title: "Cannot Create Assignment",
        description: "Please resolve conflicts before creating the assignment.",
        variant: "destructive",
        className: "bg-white text-red-600 border-red-400"
      })
      return
    }

    setLoading(true)

    try {
      // Validate required fields before submission
      if (!formData.projectName || !formData.wardId || !formData.budget || 
          !formData.roadSegmentName || !formData.contractorId || 
          !formData.startDate || !formData.endDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Project data
          projectName: formData.projectName,
          tenderId: formData.tenderId,
          projectType: formData.projectType,
          budget: parseFloat(formData.budget),
          wardId: formData.wardId,
          description: formData.description,
          // Assignment data
          roadSegmentName: formData.roadSegmentName,
          geometry: validPaths, // Send array of paths
          startLat: segment.startPoint?.lat || validPaths[0]?.[0]?.lat || 0,
          startLng: segment.startPoint?.lng || validPaths[0]?.[0]?.lng || 0,
          endLat: segment.endPoint?.lat || validPaths[validPaths.length - 1]?.[validPaths[validPaths.length - 1].length - 1]?.lat || 0,
          endLng: segment.endPoint?.lng || validPaths[validPaths.length - 1]?.[validPaths[validPaths.length - 1].length - 1]?.lng || 0,
          length: segment.length, // Total length remains the same
          userId: formData.contractorId, // Changed from contractorId to userId
          startDate: formData.startDate,
          endDate: formData.endDate,
          expectedCompletion: formData.expectedCompletion || null,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment created successfully!",
        })
        setOpen(false)
        onAssignmentCreated()
        // Reset form with all fields
        setFormData({
          projectName: "",
          tenderId: `TND-${Date.now()}`,
          projectType: "new",
          budget: "",
          wardId: "",
          description: "",
          roadSegmentName: "",
          contractorId: "",
          startDate: "",
          endDate: "",
          expectedCompletion: "",
          notes: ""
        })
        setConflicts([])
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create assignment",
          variant: "destructive",
          className: "bg-white text-red-600 border-red-400",
        })
      }
    } catch (error) {
      console.error("Failed to create assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Add conflict checking effect
  useEffect(() => {
    const checkConflicts = async () => {
      if (!formData.startDate || !formData.endDate || !segment.snappedPath) return;
      
      setIsChecking(true);
      try {
        const response = await fetch("/api/assignments/check-conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            geometry: segment.snappedPath,
            startDate: formData.startDate,
            endDate: formData.endDate
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setConflicts(data.conflicts || []);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check for conflicts",
          variant: "destructive"
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkConflicts();
  }, [formData.startDate, formData.endDate, segment.snappedPath]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Assign Road Segment</DialogTitle>
      </DialogHeader>
      <ProjectDetailsDialog 
        isOpen={showProjectDetails}
        onClose={() => setShowProjectDetails(false)}
        onSubmit={(data) => {
          setProjectDetails(data)
          setShowProjectDetails(false)
        }}
      />        
      {conflicts.length > 0 && (
        <ConflictWarning 
          conflicts={conflicts}
          onClose={() => setConflicts([])}
        />
      )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={e => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenderId">Tender ID</Label>
                <Input
                  id="tenderId"
                  value={formData.tenderId}
                  onChange={e => setFormData(prev => ({ ...prev, tenderId: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type *</Label>
                <Select
                  value={formData.projectType}
                  onValueChange={value => setFormData(prev => ({ ...prev, projectType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Construction</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="widening">Widening</SelectItem>
                    <SelectItem value="resurfacing">Resurfacing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wardId">Ward *</Label>
                <Select
                  value={formData.wardId}
                  onValueChange={value => setFormData(prev => ({ ...prev, wardId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map(ward => (
                      <SelectItem key={ward.id} value={ward.id}>
                        Ward {ward.number} - {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₹) *</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="Enter budget amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description"
              />
            </div>
          </div>

          {/* Assignment Details Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Assignment Details</h3>
            <div className="space-y-2">
              <Label htmlFor="roadSegmentName">Road Segment Name *</Label>
              <Input
                id="roadSegmentName"
                value={formData.roadSegmentName}
                onChange={e => setFormData(prev => ({ ...prev, roadSegmentName: e.target.value }))}
                placeholder="Enter road segment name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractorId">Contractor *</Label>
              <Select
                value={formData.contractorId}
                onValueChange={value => setFormData(prev => ({ ...prev, contractorId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map(contractor => (
                    <SelectItem key={contractor.id} value={contractor.id.toString()}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedCompletion">Expected Completion Date</Label>
              <Input
                id="expectedCompletion"
                type="date"
                value={formData.expectedCompletion}
                onChange={e => setFormData(prev => ({ ...prev, expectedCompletion: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
          </div>

          {segment.length && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Segment Length:</strong> {(segment.length / 1000).toFixed(2)} km
              </p>
              {segment.startPoint && segment.endPoint && (
                <>
                  <p className="text-sm text-muted-foreground">
                    <strong>Start:</strong> {segment.startPoint.lat.toFixed(6)}, {segment.startPoint.lng.toFixed(6)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>End:</strong> {segment.endPoint.lat.toFixed(6)}, {segment.endPoint.lng.toFixed(6)}
                  </p>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || conflicts.length > 0}>
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
