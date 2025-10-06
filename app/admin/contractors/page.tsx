"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardHeader } from "@/components/dashboard-header"
import { AdminShell } from "@/components/admin-shell"
import { ContractorsTable } from "@/components/contractors-table"

export default function AdminContractorsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <AdminShell>
      <DashboardHeader 
        heading="Contractors Management" 
        text="Manage and monitor all contractors and their assignments"
      >
        <Link href="/admin/contractors/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Contractor
          </Button>
        </Link>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contractors by name, ID, or specialization..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <ContractorsTable searchQuery={searchQuery} />
      </div>
    </AdminShell>
  )
}