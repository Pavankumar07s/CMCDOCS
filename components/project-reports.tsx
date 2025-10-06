"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, FileText, Download, Filter } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Report {
  id: string
  name: string
  type: string
  format: string
  url: string | null
  generatedBy: string
  createdAt: string
}

interface ProjectReportsProps {
  projectId: string
}

export function ProjectReports({ projectId }: ProjectReportsProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchReports()
  }, [projectId])

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/reports`)
      if (!response.ok) throw new Error("Failed to fetch reports")
      const data = await response.json()
      setReports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading reports")
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const getFormatBadge = (format: string) => {
    const colors: Record<string, string> = {
      pdf: "default",
      excel: "success",
      csv: "secondary"
    }
    return <Badge variant={colors[format] || "default"}>{format.toUpperCase()}</Badge>
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
        <Button variant="outline" size="sm" onClick={fetchReports}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Project Reports</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Configure Report
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{report.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {report.generatedBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getFormatBadge(report.format)}
                {report.url && (
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}