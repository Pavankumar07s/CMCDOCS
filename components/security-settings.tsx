"use client"

import { useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function SecuritySettings() {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [passwordExpiry, setPasswordExpiry] = useState("90")
  const [loginAttempts, setLoginAttempts] = useState("5")
  const [ipRestriction, setIpRestriction] = useState(false)
  const [allowedIps, setAllowedIps] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Configure security settings for the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">Require two-factor authentication for all users</p>
          </div>
          <Switch id="two-factor-auth" checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
          <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
            <SelectTrigger id="session-timeout">
              <SelectValue placeholder="Select timeout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Time of inactivity before a user is automatically logged out</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password-expiry">Password Expiry (days)</Label>
          <Select value={passwordExpiry} onValueChange={setPasswordExpiry}>
            <SelectTrigger id="password-expiry">
              <SelectValue placeholder="Select expiry period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">How often users are required to change their passwords</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-attempts">Failed Login Attempts</Label>
          <Select value={loginAttempts} onValueChange={setLoginAttempts}>
            <SelectTrigger id="login-attempts">
              <SelectValue placeholder="Select number of attempts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 attempts</SelectItem>
              <SelectItem value="5">5 attempts</SelectItem>
              <SelectItem value="10">10 attempts</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Number of failed login attempts before account is locked</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-restriction">IP Restriction</Label>
              <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
            </div>
            <Switch id="ip-restriction" checked={ipRestriction} onCheckedChange={setIpRestriction} />
          </div>

          {ipRestriction && (
            <div className="mt-2">
              <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
              <Input
                id="allowed-ips"
                placeholder="e.g., 192.168.1.1, 10.0.0.1"
                value={allowedIps}
                onChange={(e) => setAllowedIps(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">Comma-separated list of allowed IP addresses</p>
            </div>
          )}
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
