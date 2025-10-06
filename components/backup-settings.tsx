"use client"

import { useState } from "react"
import { Download, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function BackupSettings() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [backupTime, setBackupTime] = useState("03:00")
  const [retentionPeriod, setRetentionPeriod] = useState("30")
  const [backupLocation, setBackupLocation] = useState("s3")
  const [s3Bucket, setS3Bucket] = useState("ambala-road-backups")
  const [s3Region, setS3Region] = useState("ap-south-1")

  const handleManualBackup = () => {
    // In a real app, this would trigger a manual backup
    console.log("Triggering manual backup")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Settings</CardTitle>
        <CardDescription>Configure database and file backup settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-backup">Automatic Backups</Label>
            <p className="text-sm text-muted-foreground">Enable scheduled automatic backups</p>
          </div>
          <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
        </div>

        {autoBackup && (
          <>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-time">Backup Time</Label>
              <Input id="backup-time" type="time" value={backupTime} onChange={(e) => setBackupTime(e.target.value)} />
              <p className="text-xs text-muted-foreground">Time of day when backups should run (24-hour format)</p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="retention-period">Retention Period (days)</Label>
          <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
            <SelectTrigger id="retention-period">
              <SelectValue placeholder="Select retention period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How long backups should be kept before being automatically deleted
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backup-location">Backup Location</Label>
          <Select value={backupLocation} onValueChange={setBackupLocation}>
            <SelectTrigger id="backup-location">
              <SelectValue placeholder="Select backup location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local Storage</SelectItem>
              <SelectItem value="s3">Amazon S3</SelectItem>
              <SelectItem value="azure">Azure Blob Storage</SelectItem>
              <SelectItem value="gcs">Google Cloud Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {backupLocation === "s3" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s3-bucket">S3 Bucket Name</Label>
              <Input id="s3-bucket" value={s3Bucket} onChange={(e) => setS3Bucket(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s3-region">S3 Region</Label>
              <Input id="s3-region" value={s3Region} onChange={(e) => setS3Region(e.target.value)} />
            </div>
          </div>
        )}

        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium">Last Backup</h3>
          <div className="mt-2 text-sm">
            <p>
              <strong>Database:</strong> April 30, 2024, 03:00 AM
            </p>
            <p>
              <strong>File Storage:</strong> April 30, 2024, 03:15 AM
            </p>
            <p>
              <strong>Status:</strong> <span className="text-green-600">Successful</span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleManualBackup} className="gap-1">
          <Download className="h-4 w-4" />
          Manual Backup
        </Button>
        <Button className="gap-1">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
