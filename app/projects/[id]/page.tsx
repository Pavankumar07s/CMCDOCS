"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Edit, Loader2, MapPin, Upload, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { MilestoneChecklist } from "@/components/milestone-checklist"
import { PhotoGallery } from "@/components/photo-gallery"
import { ProjectAuditLog } from "@/components/project-audit-log"
import { ProjectMap } from "@/components/project-map"
import { VideoGallery } from "@/components/video-gallery"
import { toast } from "sonner"
import { AddMilestoneDialog } from "@/components/add-milestone-dialog"
import React from "react"

interface ProjectDetails {
  id: string
  name: string
  tenderId: string
  description: string
  status: string
  type: string
  startDate: string | null
  expectedCompletion: string | null
  actualCompletion: string | null
  budget: number
  spent: number
  completion: number
  ward: {
    id: string
    name: string
    number: number
  }
  location: {
    lat: number
    lng: number
  }
  users: Array<{
    role: string
    user: {
      id: string
      name: string
      email: string
      role: string
      department: string
    }
  }>
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchProjectDetails = async () => {
      setLoading(true)
      try {
        // Use /api/projects/[id] for all roles
        const response = await fetch(`/api/projects/${resolvedParams.id}`)
        if (!response.ok) throw new Error("Failed to fetch project details")
        const data = await response.json()
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading project")
        toast.error("Failed to load project details")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchProjectDetails()
    }
  }, [resolvedParams.id, status, router])

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[600px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  if (error || !project) {
    return (
      <DashboardShell>
        <div className="flex h-[600px] flex-col items-center justify-center gap-4">
          <p className="text-red-500">{error || "Project not found"}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const projectManager = project.users.find(u => u.role === "project_manager")?.user
  const siteEngineer = project.users.find(u => u.role === "engineer")?.user
  const contractor = project.users.find(u => u.role === "contractor")?.user
  const councilor = project.users.find(u => u.role === "councilor")?.user

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Road Project: ${project.tenderId}`}
        text="Comprehensive details and tracking for this road project"
      >
        <div className="flex space-x-2">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <Link href={`/projects/${resolvedParams.id}/edit`}>
            <Button size="sm" className="gap-1">
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Key details about this road project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Project Name</h3>
                    <p className="text-base">{project.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tender ID</h3>
                    <p className="text-base">{project.tenderId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Ward</h3>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">Ward {project.ward.number} - {project.ward.name}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge 
                      variant={
                        project.status === "completed" 
                          ? "default" 
                          : project.status === "in_progress" 
                            ? "default" 
                            : "secondary"
                      }
                      className={`mt-1 ${project.status === "completed" ? "bg-green-500 hover:bg-green-500/90" : ""}`}
                    >
                      {project.status.replace("_", " ").charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">
                        {project.startDate 
                          ? new Date(project.startDate).toLocaleDateString() 
                          : "Not started"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Expected Completion</h3>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">
                        {project.expectedCompletion 
                          ? new Date(project.expectedCompletion).toLocaleDateString() 
                          : "TBD"}
                      </p>
                    </div>
                  </div>
                  {projectManager && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Project Manager</h3>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-base">{projectManager.name}</p>
                      </div>
                    </div>
                  )}
                  {contractor && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Contractor</h3>
                      <p className="text-base">{contractor.name}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Project Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Overall Progress</h3>
                    <span className="text-sm font-medium">{project.completion}%</span>
                  </div>
                  <Progress value={project.completion} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="milestones">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>
            <TabsContent value="milestones">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Project Milestones</CardTitle>
                    <CardDescription>Track and update project milestones</CardDescription>
                  </div>
                  {(session?.user?.role === 'admin' || session?.user?.role === 'project_manager') && (
                    <AddMilestoneDialog 
                      projectId={resolvedParams.id} 
                      onMilestoneAdded={() => {
                        // Trigger milestone list refresh
                        const milestoneComponent = document.getElementById('milestone-checklist')
                        if (milestoneComponent) {
                          // @ts-ignore
                          milestoneComponent.refresh()
                        }
                      }} 
                    />
                  )}
                </CardHeader>
                <CardContent>
                  <MilestoneChecklist 
                    projectId={resolvedParams.id} 
                    canEdit={['admin', 'project_manager', 'engineer'].includes(session?.user?.role || '')}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="photos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Project Photos</CardTitle>
                    <CardDescription>Visual documentation of project progress</CardDescription>
                  </div>
                  <Button size="sm" className="gap-1">
                    <Upload className="h-4 w-4" />
                    Upload Photos
                  </Button>
                </CardHeader>
                <CardContent>
                  <PhotoGallery projectId={resolvedParams.id} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="videos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Project Videos</CardTitle>
                    <CardDescription>Video documentation of project progress</CardDescription>
                  </div>
                  <Button size="sm" className="gap-1">
                    <Upload className="h-4 w-4" />
                    Upload Videos
                  </Button>
                </CardHeader>
                <CardContent>
                  <VideoGallery projectId={resolvedParams.id} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="audit">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Audit Log</CardTitle>
                    <CardDescription>Complete history of project updates and changes</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Clock className="h-4 w-4" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ProjectAuditLog projectId={resolvedParams.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Geographic location of the project</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectMap location={project.location} projectId={project.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
              <CardDescription>Financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
                  <p className="text-lg font-semibold">₹ {project.budget.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Spent to Date</h3>
                  <p className="text-lg font-semibold">₹ {project.spent.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Budget Utilization</h3>
                    <span className="text-sm font-medium">{((project.spent / project.budget) * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={(project.spent / project.budget) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Contacts</CardTitle>
              <CardDescription>Project stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectManager && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Project Manager</h3>
                    <p className="text-sm">{projectManager.name}</p>
                    <p className="text-xs text-muted-foreground">{projectManager.email}</p>
                  </div>
                )}
                {siteEngineer && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Site Engineer</h3>
                    <p className="text-sm">{siteEngineer.name}</p>
                    <p className="text-xs text-muted-foreground">{siteEngineer.email}</p>
                  </div>
                )}
                {contractor && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Contractor Representative</h3>
                    <p className="text-sm">{contractor.name}</p>
                    <p className="text-xs text-muted-foreground">{contractor.email}</p>
                  </div>
                )}
                {councilor && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Ward Councilor</h3>
                    <p className="text-sm">{councilor.name}</p>
                    <p className="text-xs text-muted-foreground">{councilor.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
