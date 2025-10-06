"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { InteractiveMap } from "@/components/interactive-map"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Ward {
  id: string
  name: string
  number: number
}

export default function MapViewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wards, setWards] = useState<Ward[]>([])
  const [filters, setFilters] = useState({
    ward: "all",
    status: "all",
    type: "all",
    search: "",
    dateRange: {
      from: null as Date | null,
      to: null as Date | null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchWards = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/wards')
        if (!response.ok) throw new Error("Failed to fetch wards")
        const data = await response.json()
        setWards(data)
      } catch (err) {
        console.error("Error fetching wards:", err)
        toast.error("Failed to load wards")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchWards()
    }
  }, [status, router])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value ? new Date(value) : null
      }
    }))
  }

  const getDateInputValue = (date: Date | null) => {
    return date ? date.toISOString().split('T')[0] : ''
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Map View" 
        text="Interactive map of all road projects in Ambala" 
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter projects on the map</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Projects</label>
              <Input 
                placeholder="Search by name or ID..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ward</label>
              <Select 
                value={filters.ward}
                onValueChange={(value) => handleFilterChange('ward', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading wards..." : "Select ward"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      Ward {ward.number} - {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Status</label>
              <Select 
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="tendering">Tendering</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type</label>
              <Select 
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new">New Construction</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="widening">Widening</SelectItem>
                  <SelectItem value="resurfacing">Resurfacing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="date" 
                  placeholder="From" 
                  value={getDateInputValue(filters.dateRange.from)}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <Input 
                  type="date" 
                  placeholder="To" 
                  value={getDateInputValue(filters.dateRange.to)}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full">Apply Filters</Button>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Ambala Road Projects</CardTitle>
            <CardDescription>Interactive map showing all road projects</CardDescription>
          </CardHeader>
          <CardContent className="p-0 aspect-[16/9] md:aspect-auto md:h-[calc(100vh-15rem)]">
            <InteractiveMap filters={filters} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
