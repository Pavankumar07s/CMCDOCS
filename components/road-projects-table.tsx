"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpDown, MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import useSWR from "swr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Project {
  id: string
  name: string
  status: string
  ward: {
    id: string
    name: string
    number: number
  }
  type: string
  budget: number
  completion: number
  startDate: string | null
  users?: {
    userId: string
    role: string
  }[]
}

interface RoadProjectsTableProps {
  isAdmin?: boolean
  searchQuery?: string
  filters?: {
    status: string
    ward: string
    type: string
    budget: string
  }
}

interface RoadProjectsTableProps {
  isAdmin?: boolean
  searchQuery?: string
  filters?: {
    status: string
    ward: string
    type: string
    budget: string
  }
}

export function RoadProjectsTable({ 
  isAdmin = false, 
  searchQuery = "", 
  filters = {
    status: "all",
    ward: "all",
    type: "all",
    budget: "all"
  }
}: RoadProjectsTableProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const query = new URLSearchParams({
    ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
    ...(filters.ward && filters.ward !== "all" ? { ward: filters.ward } : {}),
    ...(filters.type && filters.type !== "all" ? { type: filters.type } : {}),
    ...(filters.budget && filters.budget !== "all" ? { budget: filters.budget } : {}),
  }).toString()

  const { data, isLoading, error: swrError } = useSWR(`/api/projects?${query}`, (url) =>
    fetch(url).then((res) => res.json())
  )

  useEffect(() => {
    if (swrError) {
      setError(swrError instanceof Error ? swrError.message : "Error loading projects")
      setLoading(false)
    } else if (isLoading) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [isLoading, swrError])

  useEffect(() => {
    if (data?.projects) {
      const projectsData = data.projects
      setProjects(projectsData)

      let filtered = projectsData
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((project: Project) => 
          project.name.toLowerCase().includes(query) ||
          project.id.toString().includes(query) ||
          project.ward.name.toLowerCase().includes(query)
        )
      }

      // Apply status filter
      if (filters.status !== 'all') {
        filtered = filtered.filter((project: Project) => 
          project.status.toLowerCase() === filters.status.toLowerCase()
        )
      }

      // Apply ward filter
      if (filters.ward !== 'all') {
        filtered = filtered.filter((project: Project) => 
          project.ward.id === filters.ward
        )
      }

      // Apply type filter
      if (filters.type !== 'all') {
        filtered = filtered.filter((project: Project) => 
          project.type.toLowerCase() === filters.type.toLowerCase()
        )
      }

      // Apply budget filter
      if (filters.budget !== 'all') {
        const [min, max] = filters.budget.split('-').map(Number)
        filtered = filtered.filter((project: Project) => 
          project.budget >= min && 
          (max ? project.budget <= max : true)
        )
      }

      setFilteredProjects(filtered)
    }
  }, [data, searchQuery, filters])

  // For contractors, filter to only assigned projects

  // For contractors, filter to only assigned projects
  const visibleProjects = session?.user?.role === "contractor" 
    ? filteredProjects.filter(p =>
        p.users?.some(u => u.userId === session.user.id && u.role === "contractor")
      )
    : filteredProjects

  const refreshData = () => {
    router.refresh()
  }

  const handleUpdateStatus = async (projectId: string, status: string) => {
    setActionLoading(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error("Failed to update status")
      
      refreshData() // Refresh projects list
      toast({
        title: "Success",
        description: "Project status updated successfully"
      })
    } catch (err) {
       toast({
        title: "Failed",
        description: "Project status update failed",
        variant: "destructive"
      })
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

    const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return
    
    setActionLoading(id)
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE"
      })
      
      if (!response.ok) throw new Error("Failed to delete project")
      
      refreshData()
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully."
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default'
      case 'in progress':
        return 'secondary'
      case 'planning':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const { toast } = useToast()
  
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        setFilteredProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch projects"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading projects...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Project Name</TableHead>
          <TableHead>Ward</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>
            <div className="flex items-center">
              Completion
              <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0">
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </div>
          </TableHead>
          <TableHead>Budget</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleProjects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">AMB-{project.id}</TableCell>
            <TableCell>{project.name}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{project.ward.name}</span>
                <span className="text-xs text-muted-foreground">Ward {project.ward.number}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={getStatusVariant(project.status)}
              >
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.startDate || "Not started"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-2 w-full max-w-[100px] rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
                <span className="text-sm">{project.completion}%</span>
              </div>
            </TableCell>
            <TableCell>₹{(project.budget / 10000000).toFixed(2)} Cr</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    disabled={actionLoading === project.id}
                  >
                    {actionLoading === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href={`/${isAdmin ? "admin/" : ""}projects/${project.id}`} className="w-full">
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => handleUpdateStatus(project.id, "In Progress")}>
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleUpdateStatus(project.id, "Completed")}>
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`/${isAdmin ? "admin/" : ""}projects/${project.id}/photos`} className="w-full">
                      Upload photos
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/admin/projects/${project.id}/edit`} className="w-full">
                          Edit project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onSelect={() => handleDelete(project.id)}
                      >
                        Delete project
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
