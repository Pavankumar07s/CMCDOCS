"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Ward } from "@prisma/client"

interface ProjectFiltersProps {
  filters: {
    status: string
    ward: string
    type: string
    budget: string
  }
  onFilter: (filters: ProjectFiltersProps["filters"]) => void
  onReset: () => void
}

export function ProjectFilters({ filters, onFilter, onReset }: ProjectFiltersProps) {
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWards() {
      try {
        const response = await fetch('/api/wards')
        if (response.ok) {
          const data = await response.json()
          setWards(data)
        }
      } catch (error) {
        console.error('Failed to fetch wards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWards()
  }, [])

  if (!filters) return null;
  return (
    <Card>
      <CardContent className="grid gap-4 p-6 grid-cols-1 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status}
            onValueChange={value => onFilter({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Planning">planning</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Tendering">tendering</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ward</label>
          <Select
            value={filters.ward}
            onValueChange={value => onFilter({ ...filters, ward: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {loading ? (
                <SelectItem value="loading" disabled>Loading wards...</SelectItem>
              ) : (
                wards.map(ward => (
                  <SelectItem key={ward.id} value={ward.id}>{`Ward ${ward.id} - ${ward.name}`}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Budget Range</label>
          <Select
            value={filters.budget}
            onValueChange={value => onFilter({ ...filters, budget: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranges</SelectItem>
              <SelectItem value="low">Below 1 Cr</SelectItem>
              <SelectItem value="medium">1-2 Cr</SelectItem>
              <SelectItem value="high">Above 2 Cr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button className="flex-1" onClick={() => onFilter(filters)}>Apply Filters</Button>
          <Button variant="outline" onClick={onReset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  )
}