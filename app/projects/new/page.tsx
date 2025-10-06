"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function NewProjectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [form, setForm] = useState({
    name: "",
    ward: "",
    type: "",
    budget: "",
    contractorId: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Fetch all users with role contractor (or any role you want to assign)
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data.users))
      .finally(() => setLoadingUsers(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelect = (key: string, value: string) => {
    setForm({ ...form, [key]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create project")
        setSaving(false)
        return
      }
      router.push("/projects")
    } catch (err) {
      setError("Failed to create project")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loadingUsers) {
    return <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Project Name" value={form.name} onChange={handleChange} required />
            <Input name="ward" placeholder="Ward ID" value={form.ward} onChange={handleChange} required />
            <Input name="type" placeholder="Type" value={form.type} onChange={handleChange} required />
            <Input name="budget" placeholder="Budget" value={form.budget} onChange={handleChange} required />
            <Select value={form.contractorId} onValueChange={v => handleSelect("contractorId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Contractor/User" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
