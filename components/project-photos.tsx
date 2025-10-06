"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Calendar, User, Info, Download, Eye, MapPin } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Photo {
  id: string
  name: string
  url: string
  description: string
  createdAt: string
  user: {
    name: string
    role: string
  }
  milestone?: {
    name: string
  }
  lat?: number
  lng?: number
}

interface ProjectPhotosProps {
  projectId: string
}

export function ProjectPhotos({ projectId }: ProjectPhotosProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  useEffect(() => {
    fetchPhotos()
  }, [projectId])

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/uploads?type=photo`)
      if (!response.ok) throw new Error("Failed to fetch photos")
      const data = await response.json()
      setPhotos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading photos")
      toast.error("Failed to load photos")
    } finally {
      setLoading(false)
    }
  }

  // Fetch signed URLs for each photo
  useEffect(() => {
    photos.forEach(photo => {
      if (!signedUrls[photo.name]) {
        fetchSignedUrl(photo.name)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos])

  const fetchSignedUrl = async (key: string) => {
    try {
      const response = await fetch(`/api/media/signed-url?key=${encodeURIComponent(key)}`)
      if (!response.ok) throw new Error("Failed to get signed URL")
      const { url } = await response.json()
      setSignedUrls(prev => ({ ...prev, [key]: url }))
    } catch (err) {
      // Optionally handle error
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
        <Button variant="outline" size="sm" onClick={fetchPhotos}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Project Photos</h3>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Upload Photos
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <Dialog key={photo.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer overflow-hidden transition-all hover:scale-[1.02]">
                <div className="aspect-video">
                  <img
                    src={signedUrls[photo.name] || ""}
                    alt={photo.name}
                    className="h-full w-full object-cover"
                    onError={() => setSignedUrls(prev => ({ ...prev, [photo.name]: "" }))}
                  />
                </div>
                <CardContent className="p-2">
                  <h4 className="text-sm font-medium line-clamp-1">{photo.name}</h4>
                  {photo.milestone && (
                    <p className="text-xs text-muted-foreground">{photo.milestone.name}</p>
                  )}
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{photo.name}</DialogTitle>
                {photo.milestone && (
                  <DialogDescription>{photo.milestone.name}</DialogDescription>
                )}
              </DialogHeader>
              <div className="grid gap-4">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={signedUrls[photo.name] || ""}
                    alt={photo.name}
                    className="w-full object-contain"
                    onError={() => setSignedUrls(prev => ({ ...prev, [photo.name]: "" }))}
                  />
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Uploaded by {photo.user.name} ({photo.user.role})
                    </span>
                  </div>
                  {photo.description && (
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{photo.description}</span>
                    </div>
                  )}
                  {/* Show location if available */}
                  {photo.lat && photo.lng && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Location: {photo.lat.toFixed(5)}, {photo.lng.toFixed(5)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <a
                    href={signedUrls[photo.name] || ""}
                    download={photo.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}