"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Loader2, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [form, setForm] = useState({
    name: "",
    department: "",
    phone: "",
    email: "",
    notificationPrefs: {
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
    },
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          setForm({
            name: data.name || "",
            department: data.department || "",
            phone: data.phone || "",
            email: data.email || "",
            notificationPrefs: {
              emailEnabled: data.notificationPrefs?.emailEnabled ?? true,
              smsEnabled: data.notificationPrefs?.smsEnabled ?? false,
              inAppEnabled: data.notificationPrefs?.inAppEnabled ?? true,
            },
            password: "",
            confirmPassword: "",
          })
        })
        .finally(() => setLoading(false))
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith("notificationPrefs.")) {
      setForm(f => ({
        ...f,
        notificationPrefs: {
          ...f.notificationPrefs,
          [name.split(".")[1]]: type === "checkbox" ? checked : value,
        }
      }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      setSaving(false)
      return
    }
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")
      setSuccess("Profile updated successfully")
      update()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>View and update your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={form.email} disabled />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={form.department} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <Label>Notification Preferences</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="emailEnabled"
                      checked={form.notificationPrefs.emailEnabled}
                      onCheckedChange={v => setForm(f => ({
                        ...f,
                        notificationPrefs: { ...f.notificationPrefs, emailEnabled: v }
                      }))}
                    />
                    <Label htmlFor="emailEnabled">Email</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="smsEnabled"
                      checked={form.notificationPrefs.smsEnabled}
                      onCheckedChange={v => setForm(f => ({
                        ...f,
                        notificationPrefs: { ...f.notificationPrefs, smsEnabled: v }
                      }))}
                    />
                    <Label htmlFor="smsEnabled">SMS</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="inAppEnabled"
                      checked={form.notificationPrefs.inAppEnabled}
                      onCheckedChange={v => setForm(f => ({
                        ...f,
                        notificationPrefs: { ...f.notificationPrefs, inAppEnabled: v }
                      }))}
                    />
                    <Label htmlFor="inAppEnabled">In-App</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
