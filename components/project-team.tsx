"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, Building, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  department: string
  role: string
  image?: string
}

interface ProjectTeamProps {
  projectId: string
}

export function ProjectTeam({ projectId }: ProjectTeamProps) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTeam()
  }, [projectId])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/team`)
      if (!response.ok) throw new Error("Failed to fetch team")
      const data = await response.json()
      setTeam(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading team")
      toast.error("Failed to load team members")
    } finally {
      setLoading(false)
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
        <Button variant="outline" size="sm" onClick={fetchTeam}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Project Team</h3>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {team.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback>
                  {member.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{member.name}</h4>
                  <Badge>{member.role}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {member.department}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}