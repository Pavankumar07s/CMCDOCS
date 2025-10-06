"use client"
import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        const obj: any = {}
        data.settings.forEach((s: any) => { obj[s.key] = s.value })
        setSettings(obj)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSwitch = (key: string, value: boolean) => {
    setSettings((prev: any) => ({ ...prev, [key]: value ? "true" : "false" }))
  }

  const handleSave = async (key: string) => {
    setSaving(true)
    setSuccess("")
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: settings[key] }),
    })
    setSaving(false)
    setSuccess("Saved!")
    setTimeout(() => setSuccess(""), 1500)
  }

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Manage system-wide settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="system-name">System Name</Label>
              <Input
                id="system-name"
                value={settings["system_name"] || ""}
                onChange={e => handleChange("system_name", e.target.value)}
              />
              <Button className="mt-2" onClick={() => handleSave("system_name")} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={settings["organization"] || ""}
                onChange={e => handleChange("organization", e.target.value)}
              />
              <Button className="mt-2" onClick={() => handleSave("organization")} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
            <div>
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                value={settings["contact_email"] || ""}
                onChange={e => handleChange("contact_email", e.target.value)}
              />
              <Button className="mt-2" onClick={() => handleSave("contact_email")} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <Switch
                id="maintenance-mode"
                checked={settings["maintenance_mode"] === "true"}
                onCheckedChange={v => handleSwitch("maintenance_mode", v)}
              />
              <Button className="ml-2" onClick={() => handleSave("maintenance_mode")} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Debug Mode</Label>
              <Switch
                id="debug-mode"
                checked={settings["debug_mode"] === "true"}
                onCheckedChange={v => handleSwitch("debug_mode", v)}
              />
              <Button className="ml-2" onClick={() => handleSave("debug_mode")} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
            {success && <div className="text-green-600">{success}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
