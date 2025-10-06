"use client"

import { useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [milestoneUpdates, setMilestoneUpdates] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [approvalRequests, setApprovalRequests] = useState(true)
  const [systemUpdates, setSystemUpdates] = useState(false)
  const [digestFrequency, setDigestFrequency] = useState("daily")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
            </div>
            <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="in-app-notifications">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications within the application</p>
            </div>
            <Switch id="in-app-notifications" checked={inAppNotifications} onCheckedChange={setInAppNotifications} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Types</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="milestone-updates">Milestone Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications for project milestone updates</p>
            </div>
            <Switch id="milestone-updates" checked={milestoneUpdates} onCheckedChange={setMilestoneUpdates} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="budget-alerts">Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications for budget changes and thresholds</p>
            </div>
            <Switch id="budget-alerts" checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="approval-requests">Approval Requests</Label>
              <p className="text-sm text-muted-foreground">Notifications for pending approvals</p>
            </div>
            <Switch id="approval-requests" checked={approvalRequests} onCheckedChange={setApprovalRequests} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-updates">System Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications for system maintenance and updates</p>
            </div>
            <Switch id="system-updates" checked={systemUpdates} onCheckedChange={setSystemUpdates} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="digest-frequency">Digest Frequency</Label>
          <Select value={digestFrequency} onValueChange={setDigestFrequency}>
            <SelectTrigger id="digest-frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">How often you want to receive notification digests</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="gap-1">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
