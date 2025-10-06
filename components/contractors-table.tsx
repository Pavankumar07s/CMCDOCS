"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface ContractorsTableProps {
  searchQuery: string
}

export function ContractorsTable({ searchQuery }: ContractorsTableProps) {
  const [loading, setLoading] = useState(true)
  const [contractors, setContractors] = useState<any[]>([])

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await fetch(`/api/contractors?search=${searchQuery}`)
        const data = await response.json()
        setContractors(data)
      } catch (error) {
        console.error("Failed to fetch contractors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContractors()
  }, [searchQuery])

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Active Projects</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contractors.map((contractor) => (
            <TableRow key={contractor.id}>
              <TableCell>{contractor.name}</TableCell>
              <TableCell>{contractor.company}</TableCell>
              <TableCell>{contractor.specialization}</TableCell>
              <TableCell>{contractor.activeProjects}</TableCell>
              <TableCell>{contractor.status}</TableCell>
            </TableRow>
          ))}
          {contractors.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No contractors found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}