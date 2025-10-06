"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Plus, Search, SlidersHorizontal, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoadProjectsTable } from "@/components/road-projects-table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProjectFilters } from "@/components/project-filters"

export default function ProjectsPage() {
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <DashboardShell>
        <div className="flex h-[600px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  if (!session) {
    return null
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="My Projects"
        text="View and manage your assigned road projects."
      >
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
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
          <ProjectFilters
            filters={filters}
            onFilter={newFilters => setFilters(newFilters)}
            onReset={() => setFilters({
              status: "all",
              ward: "all",
              type: "all",
              budget: "all"
            })}
          />
        )}
        <RoadProjectsTable 
          isAdmin={false} 
          searchQuery={searchQuery}
          filters={filters}
        />
      </div>
    </DashboardShell>
  )
}