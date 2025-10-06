"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, SlidersHorizontal, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminShell } from "@/components/admin-shell"
import { RoadProjectsTable } from "@/components/road-projects-table"
import { ProjectFilters } from "@/components/project-filters"

export default function AdminProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    ward: "all",
    type: "all",
    budget: "all"
  })

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard")
        return
      }
    }
  }, [status, session, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <AdminShell>
        <div className="flex h-[600px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminShell>
    )
  }

  // Don't render anything while redirecting
  if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
    return null
  }

  return (
    <AdminShell>
      <DashboardHeader 
        heading="Projects Management" 
        text="Manage and monitor all road construction and maintenance projects"
      >
        <Link href="/admin/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name, ID, or location..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <ProjectFilters 
                filters={filters}
                onFilter={setFilters}
                onReset={() => setFilters({
                  status: "all",
                  ward: "all",
                  type: "all",
                  budget: "all"
                })}
              />
            </CardContent>
          </Card>
        )}

        <RoadProjectsTable 
          isAdmin={true}
          searchQuery={searchQuery}
          filters={filters}
        />
      </div>
    </AdminShell>
  )
}