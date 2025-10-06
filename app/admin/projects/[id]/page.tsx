"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Edit, MapPin, Upload, User, Loader2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { MilestoneChecklist } from "@/components/milestone-checklist"
import { PhotoGallery } from "@/components/photo-gallery"
import { ProjectAuditLog } from "@/components/project-audit-log"
import { ProjectMap } from "@/components/project-map"
import { VideoGallery } from "@/components/video-gallery"
import { toast } from "sonner"
import { UploadPhotoDialog } from "@/components/upload-photo-dialog"
import { AddMilestoneDialog } from "@/components/add-milestone-dialog"

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
    }
  }>
}

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>
}



export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Unwrap params using React.use()
  const { id } = use(params)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchProjectDetails = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)
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
  }, [id, status, router])

  // Helper to format date or fallback
  const formatDate = (date: string | null | undefined) =>
    date ? new Date(date).toLocaleDateString() : "—"

  // Helper to get user by role
  const getUserByRole = (role: string) =>
    project?.users.find(u => u.role === role)?.user

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || "Project not found"}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  // Use helpers to get users
  const projectManager = getUserByRole("project_manager")
  const siteEngineer = getUserByRole("engineer")
  const contractor = getUserByRole("contractor")
  const councilor = getUserByRole("councilor")

  return (
    <>
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
          {(session?.user?.role === "admin" || projectManager?.id === session?.user?.id) && (
            <Link href={`/projects/${project.id}/edit`}>
              <Button size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                Edit Project
              </Button>
            </Link>
          )}
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
                          ? "success" 
                          : project.status === "in_progress" 
                            ? "default" 
                            : "secondary"
                      }
                      className="mt-1"
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
                          ? formatDate(project.startDate)
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Expected Completion</h3>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">
                        {project.expectedCompletion
                          ? formatDate(project.expectedCompletion)
                          : "—"}
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
                  <p className="text-sm text-muted-foreground">{project.description}</p>
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
                    <div className="flex gap-2">
                      <AddMilestoneDialog 
                        projectId={project.id} 
                        onMilestoneAdded={() => {
                          // Force refresh the milestone list
                          const milestoneComponent = document.getElementById('milestone-list')
                          if (milestoneComponent) {
                            // @ts-ignore
                            milestoneComponent.refresh()
                          }
                        }} 
                      />
                      <Button size="sm" className="gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Update Status
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div id="milestone-list">
                    <MilestoneChecklist 
                      projectId={project.id}
                      canEdit={['admin', 'project_manager', 'engineer'].includes(session?.user?.role || '')}
                    />
                  </div>
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
                  {(session?.user?.role === 'admin' || session?.user?.role === 'project_manager' || session?.user?.role === 'engineer') && (
                    <UploadPhotoDialog 
                      projectId={project.id}
                      onPhotoUploaded={() => {
                        // Force refresh the photo gallery
                        const galleryComponent = document.getElementById('photo-gallery')
                        if (galleryComponent) {
                          // @ts-ignore
                          galleryComponent.refresh()
                        }
                      } } milestones={[]}                    />
                  )}
                </CardHeader>
                <CardContent>
                  <div id="photo-gallery">
                    <PhotoGallery projectId={project.id} />
                  </div>
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
                  <VideoGallery projectId={project.id} />
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
                  <ProjectAuditLog projectId={project.id} />
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
                  <p className="text-lg font-semibold">₹ {(project.budget / 100000).toFixed(2)} Lakhs</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Spent to Date</h3>
                  <p className="text-lg font-semibold">₹ {(project.spent / 100000).toFixed(2)} Lakhs</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Budget Utilization</h3>
                    <span className="text-sm font-medium">
                      {((project.spent / project.budget) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(project.spent / project.budget) * 100} 
                    className="h-2" 
                  />
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
                    <h3 className="text-sm font-medium text-muted-foreground">Contractor</h3>
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
    </>
  )
}