"use client"

import { useEffect, useState } from "react"
import { Loader2, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminTendersPage() {
  const [tenders, setTenders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/tenders")
      .then(res => res.json())
      .then(data => setTenders(data.tenders))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tenders</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Tender ID</th>
                <th className="text-left">Project Name</th>
                <th className="text-left">Status</th>
                <th className="text-left">Budget</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map(tender => (
                <tr key={tender.id}>
                  <td>{tender.tenderId}</td>
                  <td>{tender.name}</td>
                  <td>{tender.status}</td>
                  <td>₹ {tender.budget.toLocaleString()}</td>
                  <td>
                    <Link href={`/admin/tenders/${tender.id}`}>
                      <Button size="sm" variant="outline" className="mr-2"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Link href={`/admin/tenders/${tender.id}/edit`}>
                      <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
