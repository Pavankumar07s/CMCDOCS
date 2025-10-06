"use client"

import { useState } from "react"
import { Save, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export function EmailSettings() {
  const [smtpServer, setSmtpServer] = useState("smtp.example.com")
  const [smtpPort, setSmtpPort] = useState("587")
  const [smtpUsername, setSmtpUsername] = useState("notifications@ambala.gov.in")
  const [smtpPassword, setSmtpPassword] = useState("********")
  const [fromEmail, setFromEmail] = useState("noreply@ambala.gov.in")
  const [fromName, setFromName] = useState("Ambala Road Management System")
  const [useTls, setUseTls] = useState(true)
  const [emailFooter, setEmailFooter] = useState(
    "This is an automated message from the Ambala Road Management System. Please do not reply to this email.",
  )

  const handleTestEmail = () => {
    // In a real app, this would send a test email
    console.log("Sending test email with the following settings:", {
      smtpServer,
      smtpPort,
      smtpUsername,
      fromEmail,
      fromName,
      useTls,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>Configure email server settings for notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-server">SMTP Server</Label>
            <Input id="smtp-server" value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-port">SMTP Port</Label>
            <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-username">SMTP Username</Label>
            <Input id="smtp-username" value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-password">SMTP Password</Label>
            <Input
              id="smtp-password"
              type="password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-email">From Email</Label>
            <Input id="from-email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-name">From Name</Label>
            <Input id="from-name" value={fromName} onChange={(e) => setFromName(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="use-tls">Use TLS/SSL</Label>
            <p className="text-sm text-muted-foreground">Enable secure connection for email</p>
          </div>
          <Switch id="use-tls" checked={useTls} onCheckedChange={setUseTls} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-footer">Email Footer</Label>
          <Textarea id="email-footer" value={emailFooter} onChange={(e) => setEmailFooter(e.target.value)} rows={3} />
          <p className="text-xs text-muted-foreground">
            This text will be added to the bottom of all emails sent by the system
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleTestEmail} className="gap-1">
          <Send className="h-4 w-4" />
          Send Test Email
        </Button>
        <Button className="gap-1">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
