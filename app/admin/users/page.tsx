"use client"

import { useEffect, useState } from "react"
import { Loader2, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = () => {
    setLoading(true)
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data.users))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    fetchUsers()
  }

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">System Users</h2>
        <Link href="/admin/users/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Email</th>
                <th className="text-left">Role</th>
                <th className="text-left">Department</th>
                <th className="text-left">Status</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.department}</td>
                  <td>{user.status}</td>
                  <td>
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button size="sm" variant="outline" className="mr-2"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
