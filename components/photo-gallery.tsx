"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, Eye, Info, User, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { PlaceholderMedia } from "./placeholder-media"

import { Button } from "@/components/ui/button"
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
  url: string
  fileName: string
  description?: string
  fileSize: number
  fileType: string
  milestone?: {
    id: string
    name: string
  }
  uploadedBy: string
  user: {
    name: string
    role: string
  }
  createdAt: string
  lat?: number
  lng?: number
}

interface PhotoGalleryProps {
  projectId: string
  canEdit?: boolean
}

export function PhotoGallery({ projectId, canEdit = false }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchSignedUrl = async (key: string) => {
    try {
      const response = await fetch(`/api/media/signed-url?key=${encodeURIComponent(key)}`)
      if (!response.ok) throw new Error("Failed to get signed URL")
      const { url } = await response.json()
      setSignedUrls((prev: Record<string, string>) => ({ ...prev, [key]: url }))
    } catch (err) {
      console.error("Error getting signed URL:", err)
      toast.error("Failed to load image")
      setSignedUrls((prev: Record<string, string>) => ({ ...prev, [key]: "" }))
    }
  }

  useEffect(() => {
    const fetchUrls = async () => {
      const promises = photos.map(async (photo) => {
        if (!signedUrls[photo.fileName]) {
          await fetchSignedUrl(photo.fileName);
        }
      });
      await Promise.all(promises);
    };
    fetchUrls();
  }, [photos]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/photos`)
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

  useEffect(() => {
    fetchPhotos()
  }, [projectId])

  // Add refresh method to component instance
  useEffect(() => {
    const element = document.getElementById('photo-gallery')
    if (element) {
      // @ts-ignore
      element.refresh = fetchPhotos
    }
  }, [fetchPhotos])

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      const response = await fetch(`/api/projects/${projectId}/photos/${photoId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error("Failed to delete photo")
      toast.success("Photo deleted successfully")
      fetchPhotos() // Refresh the list
    } catch (err) {
      toast.error("Failed to delete photo")
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

  if (photos.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <Dialog key={photo.id}>
          <DialogTrigger asChild>
            <div className="group relative cursor-pointer overflow-hidden rounded-md border">
              <div className="aspect-video overflow-hidden bg-muted">
                {signedUrls[photo.fileName] ? (
                  <img
                    src={signedUrls[photo.fileName]}
                    alt={photo.description || "Project photo"}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={() => {
                      // Clear signed URL to trigger re-fetch
                      setSignedUrls(prev => ({ ...prev, [photo.fileName]: "" }))
                    }}
                  />
                ) : (
                  <PlaceholderMedia type="image" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-muted-foreground">
                  {photo.milestone?.name || "General Photo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(photo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{photo.milestone?.name || "Project Photo"}</DialogTitle>
              <DialogDescription>
                Uploaded on {new Date(photo.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-lg bg-muted relative min-h-[300px]">
                {signedUrls[photo.fileName] ? (
                  <img
                    src={signedUrls[photo.fileName]}
                    alt={photo.description || "Project photo"}
                    className="w-full h-full max-h-[60vh] object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite retry
                      fetchSignedUrl(photo.fileName); // Try to get a new signed URL
                      target.src = ""; // Clear the broken image
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Uploaded by {photo.user.name} ({photo.user.role})</span>
                </div>
                {photo.description && (
                  <div className="flex items-start gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{photo.description}</span>
                  </div>
                )}
                {/* Show location if available */}
                {photo.lat && photo.lng && (
                  <div className="p-2 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      Location: {photo.lat.toFixed(5)}, {photo.lng.toFixed(5)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <a 
                  href={signedUrls[photo.fileName]} // Use signed URL for download too
                  download={photo.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </a>
                {canEdit && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(photo.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
