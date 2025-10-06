"use client"

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState, useEffect } from "react"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import exifr from "exifr" // npm install exifr

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Milestone {
  id: string
  name: string
}

interface UploadPhotoDialogProps {
  projectId: string
  milestoneId?: string
  onPhotoUploaded?: () => void
  children: ReactNode
  checklistItems?: { id: string, name: string }[] // Add this prop
}

export function UploadPhotoDialog({
  projectId,
  milestoneId,
  onPhotoUploaded,
  children,
  checklistItems = []
}: UploadPhotoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [selectedMilestone, setSelectedMilestone] = useState(milestoneId)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [captureMode, setCaptureMode] = useState(false)
  const [gps, setGps] = useState<{ lat: number, lng: number } | null>(null)
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<string>("")

  useEffect(() => {
    if (open) {
      const fetchMilestones = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}/milestones`)
          if (!response.ok) throw new Error("Failed to fetch milestones")
          const data = await response.json()
          setMilestones(data)
        } catch (err) {
          toast.error("Failed to load milestones")
        }
      }
      fetchMilestones()
    }
  }, [open, projectId])

  // Helper to extract GPS from image file
  const extractGpsFromFile = async (file: File) => {
    try {
      const exif = await exifr.gps(file)
      if (exif && exif.latitude && exif.longitude) {
        return { lat: exif.latitude, lng: exif.longitude }
      }
    } catch {}
    return null
  }

  // Capture mode: get live GPS
  const handleCapturePhoto = async () => {
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

    // If capture mode, require live GPS
    if (captureMode) {
      if (!gps) {
        toast.error("Location required for captured photo")
        setLoading(false)
        return
      }
      lat = gps.lat
      lng = gps.lng
    } else {
      // Try to extract from file
      const gpsMeta = await extractGpsFromFile(files[0])
      if (gpsMeta) {
        lat = gpsMeta.lat
        lng = gpsMeta.lng
      }
    }

    Array.from(files).forEach(file => {
      formData.append('photos', file)
    })
    if (selectedMilestone) {
      formData.append('milestoneId', selectedMilestone)
    }
    if (selectedChecklistItem) {
      formData.append('checklistItemId', selectedChecklistItem)
    }
    formData.append('description', e.currentTarget.description.value)
    if (lat && lng) {
      formData.append('lat', String(lat))
      formData.append('lng', String(lng))
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/photos`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error("Failed to upload photos")

      toast.success("Photos uploaded successfully")
      setOpen(false)
      setFiles(null)
      setGps(null)
      setCaptureMode(false)
      onPhotoUploaded?.()
    } catch (err) {
      toast.error("Failed to upload photos")
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
          <DialogTitle>Upload Project Photos</DialogTitle>
          <DialogDescription>
            Add photos to document project progress
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={captureMode ? "default" : "outline"} onClick={handleCapturePhoto}>
              Capture Photo (Live GPS)
            </Button>
            <Button type="button" variant={!captureMode ? "default" : "outline"} onClick={() => setCaptureMode(false)}>
              Upload from Device
            </Button>
          </div>
          <div>
            <Label htmlFor="photos">Select Photos</Label>
            <Input
              id="photos"
              name="photos"
              type="file"
              accept="image/*"
              multiple
              required
              onChange={(e) => setFiles(e.target.files)}
              capture={captureMode ? "environment" : undefined}
              // Only allow capture in captureMode
              disabled={captureMode && !navigator.mediaDevices}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP
            </p>
          </div>
          {milestones.length > 0 && (
            <div>
              <Label htmlFor="milestone">Related Milestone</Label>
              <Select 
                value={selectedMilestone} 
                onValueChange={setSelectedMilestone}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone" />
                </SelectTrigger>
                <SelectContent>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
            <Input id="description" name="description" required />
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