"use client"

import { useState, useEffect, useCallback } from "react"
import { Camera, Check, Clock, FileCheck, FileText, Loader2, Video } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UploadPhotoDialog } from "@/components/upload-photo-dialog"
import { UploadVideoDialog } from "@/components/upload-video-dialog"

interface ChecklistItem {
  id: string
  name: string
  checked: boolean
  amount?: number
}

interface Milestone {
  id: string
  name: string
  description: string | null
  status: string
  date: string | null
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
  photos?: { id: string, url: string, description?: string }[]
  videos?: { id: string, url: string, description?: string }[]
}

interface MilestoneChecklistProps {
  projectId: string
  canEdit?: boolean
}
type ActivityAction =
  | "MILESTONE_CREATED"
  | "MILESTONE_UPDATED"
  | "MILESTONE_COMPLETED"
  | "STATUS_UPDATED"
  | "PHOTO_UPLOADED"
  | "VIDEO_UPLOADED"
  | "CHECKLIST_UPDATED"
  | "APPROVAL_REQUIRED"
  | "APPROVAL_GRANTED"
  | "APPROVAL_REJECTED"
  
export function MilestoneChecklist({ projectId, canEdit = false }: MilestoneChecklistProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Add refresh method
  const refresh = useCallback(async () => {
    setLoading(true)
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
  }, [projectId])

  // Use refresh in useEffect
  useEffect(() => {
    refresh()
  }, [refresh])

  // Add the refresh method to the component instance
  useEffect(() => {
    const element = document.getElementById('milestone-list')
    if (element) {
      // @ts-ignore
      element.refresh = refresh
    }
  }, [refresh])

  const updateChecklistItem = async (milestoneId: string, itemId: string, checked: boolean) => {
    if (!canEdit) {
      toast.error("You don't have permission to update milestones")
      return
    }

    // Enforce: must have photo and video with location for this checklist item before allowing completion
    if (checked) {
      // Fetch photos and videos for this milestone/checklist
      const resPhoto = await fetch(`/api/projects/${projectId}/photos?milestoneId=${milestoneId}&checklistItemId=${itemId}`)
      const resVideo = await fetch(`/api/projects/${projectId}/videos?milestoneId=${milestoneId}&checklistItemId=${itemId}`)
      const photos = resPhoto.ok ? await resPhoto.json() : []
      const videos = resVideo.ok ? await resVideo.json() : []
      const hasPhotoWithLocation = photos.some((p: any) => p.lat && p.lng)
      const hasVideoWithLocation = videos.some((v: any) => v.lat && v.lng)
      if (!hasPhotoWithLocation || !hasVideoWithLocation) {
        toast.error("You must upload at least one photo and one video with location for this checklist item before completing it.")
        return
      }
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked })
      })
      
      if (!response.ok) throw new Error("Failed to update checklist item")
      
      // Update local state optimistically
      setMilestones(prevMilestones => 
        prevMilestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              checklist: milestone.checklist.map(item => 
                item.id === itemId ? { ...item, checked } : item
              )
            }
          }
          return milestone
        })
      )

      toast.success("Progress updated successfully")
      
      // Refresh the list to get updated completion percentages
      refresh()

    } catch (err) {
      toast.error("Failed to update progress")
    }
  }

  const getCompletionPercentage = (milestone: Milestone) => {
    if (!milestone.checklist.length) return 0
    const completed = milestone.checklist.filter(item => item.checked).length
    return Math.round((completed / milestone.checklist.length) * 100)
  }

  const getCompletedAmount = (milestone: Milestone) =>
    milestone.checklist.filter(item => item.checked).reduce((sum, item) => sum + (item.amount || 0), 0)

  const getTotalAmount = (milestone: Milestone) =>
    milestone.checklist.reduce((sum, item) => sum + (item.amount || 0), 0)

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
        <Button variant="outline" size="sm" onClick={refresh}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div id="milestone-list" className="space-y-6">
      {milestones.map((milestone) => (
        <div key={milestone.id} className="rounded-lg border p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{milestone.name}</h3>
                <Badge
                  variant={
                    milestone.status === "completed"
                      ? "default"
                      : milestone.status === "in_progress"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {milestone.status.replace("_", " ").charAt(0).toUpperCase() + 
                   milestone.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{milestone.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {milestone.date 
                    ? new Date(milestone.date).toLocaleDateString()
                    : "No date set"}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Checklist Progress</h4>
                <span className="text-sm font-medium">
                  {getCompletionPercentage(milestone)}%
                </span>
              </div>
              <Progress 
                value={getCompletionPercentage(milestone)} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              {milestone.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(checked) => 
                      updateChecklistItem(milestone.id, item.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={item.id}
                    className="flex-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.name}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    ₹{item.amount?.toLocaleString() ?? 0}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-end text-xs text-muted-foreground">
              Completed: ₹{getCompletedAmount(milestone).toLocaleString()} / ₹{getTotalAmount(milestone).toLocaleString()}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <UploadPhotoDialog
              projectId={projectId}
              milestoneId={milestone.id}
              onPhotoUploaded={refresh}
              checklistItems={milestone.checklist.map(item => ({ id: item.id, name: item.name }))}
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Add Photos
              </Button>
            </UploadPhotoDialog>

            <UploadVideoDialog
              projectId={projectId}
              milestoneId={milestone.id}
              onVideoUploaded={refresh}
              checklistItems={milestone.checklist.map(item => ({ id: item.id, name: item.name }))}
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                Add Videos
              </Button>
            </UploadVideoDialog>

            {((milestone.photos && milestone.photos.length > 0) || (milestone.videos && milestone.videos.length > 0)) && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    View Media ({(milestone.photos?.length || 0) + (milestone.videos?.length || 0)})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{milestone.name} - Media</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    {(milestone.photos && milestone.photos.length > 0) && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Photos</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {milestone.photos.map((photo) => (
                            <div key={photo.id} className="aspect-video overflow-hidden rounded-md">
                              <img
                                src={photo.url}
                                alt={photo.description || "Project photo"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(milestone.videos && milestone.videos.length > 0) && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Videos</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {milestone.videos.map((video) => (
                            <div key={video.id} className="aspect-video overflow-hidden rounded-md bg-muted">
                              <video
                                src={video.url}
                                controls
                                className="h-full w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
