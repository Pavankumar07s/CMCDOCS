"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Approval {
  id: string
  type: string
  status: string
  details: string | null
  requestedAt: string
  requestedBy: {
    name: string
    role: string
  }
  approvedBy?: {
    name: string
    role: string
  }
  approvedAt?: string
  milestone?: {
    name: string
  }
}

interface ProjectApprovalsProps {
  projectId: string
}

export function ProjectApprovals({ projectId }: ProjectApprovalsProps) {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchApprovals()
  }, [projectId])

  const fetchApprovals = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/approvals`)
      if (!response.ok) throw new Error("Failed to fetch approvals")
      const data = await response.json()
      setApprovals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading approvals")
      toast.error("Failed to load approvals")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
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
        <Button variant="outline" size="sm" onClick={fetchApprovals}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Project Approvals</h3>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Request Approval
        </Button>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium capitalize">{approval.type} Approval</h4>
                    {getStatusBadge(approval.status)}
                  </div>
                  {approval.milestone && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Milestone: {approval.milestone.name}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(approval.requestedAt).toLocaleDateString()}
                </p>
              </div>

              {approval.details && (
                <p className="mt-2 text-sm">{approval.details}</p>
              )}

              <Separator className="my-4" />

              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    Requested by: {approval.requestedBy.name} ({approval.requestedBy.role})
                  </p>
                  {approval.approvedBy && (
                    <p className="text-muted-foreground">
                      {approval.status === "approved" ? "Approved" : "Rejected"} by:{" "}
                      {approval.approvedBy.name} ({approval.approvedBy.role})
                    </p>
                  )}
                </div>
                {approval.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm" className="gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}