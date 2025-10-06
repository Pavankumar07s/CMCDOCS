"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MapPin, User } from "lucide-react"

interface Conflict {
  id: number
  road_segment_name: string
  contractor_name: string
  start_date: string
  end_date: string
  overlap_length_meters: number
  total_segment_length_meters?: number
  overlap_percentage?: number
  project_type?: string
}

interface ConflictWarningProps {
  conflicts: Conflict[]
  onClose: () => void
}
export function ConflictWarning({ conflicts }: ConflictWarningProps) {
  if (conflicts.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>⚠️ Project Overlap Detected</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3 font-medium">
          This road segment conflicts with {conflicts.length} existing project{conflicts.length > 1 ? "s" : ""}:
        </p>
        <div className="space-y-3">
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium text-sm">{conflict.road_segment_name}</span>
                    {conflict.project_type && (
                      <Badge variant="secondary" className="text-xs">
                        {conflict.project_type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <User className="h-3 w-3" />
                    <span>Contractor: {conflict.contractor_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(conflict.start_date).toLocaleDateString()} -{" "}
                      {new Date(conflict.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs mb-1">
                    {(conflict.overlap_length_meters / 1000).toFixed(2)} km
                  </Badge>
                  {conflict.overlap_percentage && (
                    <div className="text-xs text-muted-foreground">{conflict.overlap_percentage}% overlap</div>
                  )}
                </div>
              </div>
              {conflict.overlap_percentage && (
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-destructive h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(conflict.overlap_percentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Action Required:</strong> Please adjust the project dates or select a different road segment to
            avoid conflicts with existing work.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
