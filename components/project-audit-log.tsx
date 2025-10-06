"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AuditLog {
  id: string
  action: string
  details?: string
  user: {
    name: string
    email: string
  }
  createdAt: string
}

interface ProjectAuditLogProps {
  projectId: string
}

export function ProjectAuditLog({ projectId }: ProjectAuditLogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const lastTimestampRef = useRef<number>(Date.now())
  const pollingIntervalRef = useRef<NodeJS.Timeout>()

  const fetchLogs = async (pageNum: number = 1) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/audit-logs?page=${pageNum}`)
      if (!response.ok) throw new Error("Failed to fetch audit logs")
      const data = await response.json()
      
      if (pageNum === 1) {
        setLogs(data.logs)
      } else {
        setLogs(prev => [...prev, ...data.logs])
      }
      
      setHasMore(data.hasMore)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading audit logs")
      toast.error("Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  const pollNewLogs = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/audit-logs/poll?since=${lastTimestampRef.current}`
      )
      if (!response.ok) throw new Error("Failed to poll audit logs")
      const data = await response.json()
      
      if (data.logs.length > 0) {
        setLogs(prev => [...data.logs, ...prev])
      }
      
      lastTimestampRef.current = data.timestamp
    } catch (err) {
      console.error("Polling error:", err)
    }
  }

  useEffect(() => {
    fetchLogs()
    
    // Start polling every 5 seconds
    pollingIntervalRef.current = setInterval(pollNewLogs, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [projectId])

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && logs.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchLogs()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {logs.map((log) => (
        <div key={log.id} className="flex">
          <div className="mr-4 flex flex-col items-center">
            <Avatar className="h-9 w-9 border">
              <AvatarFallback>
                {log.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2 h-full w-px grow bg-border" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{log.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <p className="font-medium">{log.action}</p>
            <p className="text-sm text-muted-foreground">{log.details}</p>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPage(p => p + 1)
              fetchLogs(page + 1)
            }}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
