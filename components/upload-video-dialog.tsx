"use client"

import { useState } from "react"
import { Video, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UploadVideoDialogProps {
  projectId: string
  milestoneId: string
  onVideoUploaded: () => void
  children: React.ReactNode
  checklistItems?: { id: string, name: string }[] // Add this prop
}

export function UploadVideoDialog({
  projectId,
  milestoneId,
  onVideoUploaded,
  children,
  checklistItems = []
}: UploadVideoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [captureMode, setCaptureMode] = useState(false)
  const [gps, setGps] = useState<{ lat: number, lng: number } | null>(null)
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<string>("")

  // Capture mode: get live GPS
  const handleCaptureVideo = async () => {
    setCaptureMode(true)
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported")
      setCaptureMode(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        toast.error("Unable to get location")
        setCaptureMode(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!files?.length) return

    setLoading(true)
    const formData = new FormData()
    let lat: number | undefined, lng: number | undefined

    if (captureMode) {
      if (!gps) {
        toast.error("Location required for captured video")
        setLoading(false)
        return
      }
      lat = gps.lat
      lng = gps.lng
    }
    // For local files, browser cannot extract GPS from video easily

    Array.from(files).forEach(file => {
      formData.append('videos', file)
    })
    formData.append('milestoneId', milestoneId)
    if (selectedChecklistItem) {
      formData.append('checklistItemId', selectedChecklistItem)
    }
    formData.append('description', e.currentTarget.description.value)
    if (lat && lng) {
      formData.append('lat', String(lat))
      formData.append('lng', String(lng))
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/videos`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Failed to upload videos")

      toast.success("Videos uploaded successfully")
      setOpen(false)
      setFiles(null)
      setGps(null)
      setCaptureMode(false)
      onVideoUploaded()
    } catch (err) {
      toast.error("Failed to upload videos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Videos</DialogTitle>
          <DialogDescription>
            Add video documentation for this milestone
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={captureMode ? "default" : "outline"} onClick={handleCaptureVideo}>
              Capture Video (Live GPS)
            </Button>
            <Button type="button" variant={!captureMode ? "default" : "outline"} onClick={() => setCaptureMode(false)}>
              Upload from Device
            </Button>
          </div>
          <div>
            <Label htmlFor="videos">Select Videos</Label>
            <Input
              id="videos"
              type="file"
              accept="video/*"
              multiple
              required
              onChange={(e) => setFiles(e.target.files)}
              capture={captureMode ? "environment" : undefined}
              // Only allow capture in captureMode
              disabled={captureMode && !navigator.mediaDevices}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Supported formats: MP4, WebM (max 100MB)
            </p>
          </div>
          {checklistItems.length > 0 && (
            <div>
              <Label htmlFor="checklist-item">Related Checklist Item</Label>
              <Select
                value={selectedChecklistItem}
                onValueChange={setSelectedChecklistItem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select checklist item" />
                </SelectTrigger>
                <SelectContent>
                  {checklistItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what these videos show..."
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}