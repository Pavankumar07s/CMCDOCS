"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, Play, User, Info, Loader2, MapPin } from "lucide-react"
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

interface Video {
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

interface VideoGalleryProps {
  projectId: string
  canEdit?: boolean
}

export function VideoGallery({ projectId, canEdit = false }: VideoGalleryProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchSignedUrl = async (key: string) => {
    try {
      const response = await fetch(`/api/media/signed-url?key=${encodeURIComponent(key)}`)
      if (!response.ok) throw new Error("Failed to get signed URL")
      const { url } = await response.json()
      setSignedUrls(prev => ({ ...prev, [key]: url }))
    } catch (err) {
      console.error("Error getting signed URL:", err)
    }
  }

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/videos`)
      if (!response.ok) throw new Error("Failed to fetch videos")
      const data = await response.json()
      setVideos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading videos")
      toast.error("Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [projectId])

  useEffect(() => {
    videos.forEach(video => {
      if (!signedUrls[video.fileName]) {
        fetchSignedUrl(video.fileName)
      }
    })
  }, [videos])

  // Add refresh method to component instance
  useEffect(() => {
    const element = document.getElementById('video-gallery')
    if (element) {
      // @ts-ignore
      element.refresh = fetchVideos
    }
  }, [fetchVideos])

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const response = await fetch(`/api/projects/${projectId}/videos/${videoId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error("Failed to delete video")
      toast.success("Video deleted successfully")
      fetchVideos() // Refresh the list
    } catch (err) {
      toast.error("Failed to delete video")
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
        <Button variant="outline" size="sm" onClick={fetchVideos}>
          Try Again
        </Button>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">No videos uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {videos.map((video) => (
        <Dialog key={video.id}>
          <DialogTrigger asChild>
            <div className="group relative cursor-pointer overflow-hidden rounded-md border">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {signedUrls[video.fileName] ? (
                  <video 
                    src={signedUrls[video.fileName]}
                    className="h-full w-full object-cover"
                    preload="metadata"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Video load error:', e);
                      // Clear signed URL to trigger re-fetch
                      setSignedUrls(prev => ({ ...prev, [video.fileName]: "" }))
                    }}
                    muted
                    playsInline
                  />
                ) : (
                  <PlaceholderMedia type="video" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40">
                  <div className="rounded-full bg-white/90 p-3">
                    <Play className="h-6 w-6 fill-primary text-primary" />
                  </div>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted-foreground">
                  {video.milestone?.name || "General Video"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{video.milestone?.name || "Project Video"}</DialogTitle>
              <DialogDescription>
                Uploaded on {new Date(video.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                {signedUrls[video.fileName] ? (
                  <video 
                    src={signedUrls[video.fileName]}
                    controls
                    className="h-full w-full"
                    crossOrigin="anonymous"
                    controlsList="nodownload"
                    onError={(e) => {
                      console.error('Video playback error:', e);
                      toast.error("Failed to load video");
                      setSignedUrls(prev => ({ ...prev, [video.fileName]: "" }))
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <PlaceholderMedia type="video" />
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Uploaded by {video.user.name} ({video.user.role})</span>
                </div>
                {video.description && (
                  <div className="flex items-start gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{video.description}</span>
                  </div>
                )}
                {/* Show location if available */}
                {video.lat && video.lng && (
                  <div className="p-2 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>
                      Location: {video.lat.toFixed(5)}, {video.lng.toFixed(5)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <a 
                  href={signedUrls[video.fileName]}
                  download={video.fileName}
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
                    onClick={() => handleDelete(video.id)}
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
