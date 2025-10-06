"use client"

import { useState } from "react"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeader } from "@/components/admin-header"
import { AdminShell } from "@/components/admin-shell"
import { AdvancedSearchResults } from "@/components/advanced-search-results"
import { SearchFilters } from "@/components/search-filters"

export default function AdminSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("projects")

  return (
    <AdminShell>
      <AdminHeader heading="Advanced Search" text="Search for projects, tenders, users, and more" />

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Enter keywords to search across the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by project name, tender ID, location, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Search in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="tenders">Tenders</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-1">
                <SearchIcon className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="filters">Advanced Filters</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          <AdvancedSearchResults query={searchQuery} type={searchType} />
        </TabsContent>
        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Filters</CardTitle>
              <CardDescription>Refine your search with advanced filters</CardDescription>
            </CardHeader>
            <CardContent>
              <SearchFilters />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminShell>
  )
}
