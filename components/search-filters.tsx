"use client"

import { useState } from "react"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export function SearchFilters() {
  const [ward, setWard] = useState("all")
  const [status, setStatus] = useState("all")
  const [projectType, setProjectType] = useState("all")
  const [budget, setBudget] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  const handleApplyFilters = () => {
    // In a real app, this would update the search results
    console.log({
      ward,
      status,
      projectType,
      budget,
      dateFrom,
      dateTo,
    })
  }
  
  const handleResetFilters = () => {
    setWard("all")
    setStatus("all")
    setProjectType("all")
    setBudget("all")
    setDateFrom("")
    setDateTo("")
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="ward-filter">Ward</Label>
          <Select value={ward} onValueChange={setWard}>
            <SelectTrigger id="ward-filter">
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              <SelectItem value="1">Ward 1</SelectItem>
              <SelectItem value="2">Ward 2</SelectItem>
              <SelectItem value="3">Ward 3</SelectItem>
              <SelectItem value="4">Ward 4</SelectItem>
              <SelectItem value="5">Ward 5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-filter">
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
          <Label htmlFor="type-filter">Project Type</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger id="type-filter">
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
          <Label htmlFor="budget-filter">Budget Range</Label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger id="budget-filter">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="low">Low (&lt; ₹1 Cr)</SelectItem>
              <SelectItem value="medium">Medium (₹1-2 Cr)</SelectItem>
              <SelectItem value="high">High (&gt; ₹2 Cr)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-from">From Date</Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">To Date</Label>
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="gap-1">
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
