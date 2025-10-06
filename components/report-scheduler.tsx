"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Clock, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function ReportScheduler() {
  const [reportName, setReportName] = useState("")
  const [reportType, setReportType] = useState("projects")
  const [schedule, setSchedule] = useState("weekly")
  const [day, setDay] = useState("monday")
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("09:00")
  const [recipients, setRecipients] = useState(["admin@ambala.gov.in"])
  const [newRecipient, setNewRecipient] = useState("")
  const [formats, setFormats] = useState<string[]>(["pdf"])

  const handleAddRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient])
      setNewRecipient("")
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email))
  }

  const handleFormatChange = (format: string) => {
    setFormats((current) => (current.includes(format) ? current.filter((f) => f !== format) : [...current, format]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    console.log({
      reportName,
      reportType,
      schedule,
      day,
      date,
      time,
      recipients,
      formats,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder="e.g., Weekly Projects Overview"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType} required>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="projects">Projects Overview</SelectItem>
                <SelectItem value="budget">Budget Analysis</SelectItem>
                <SelectItem value="completion">Completion Rates</SelectItem>
                <SelectItem value="ward">Ward Comparison</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Schedule</Label>
          <Select value={schedule} onValueChange={setSchedule} required>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {schedule === "weekly" && (
          <div className="space-y-2">
            <Label htmlFor="day">Day of Week</Label>
            <Select value={day} onValueChange={setDay} required>
              <SelectTrigger id="day">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {schedule === "monthly" && (
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Report Format</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="format-pdf"
                checked={formats.includes("pdf")}
                onCheckedChange={() => handleFormatChange("pdf")}
              />
              <Label htmlFor="format-pdf" className="text-sm">
                PDF
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="format-excel"
                checked={formats.includes("excel")}
                onCheckedChange={() => handleFormatChange("excel")}
              />
              <Label htmlFor="format-excel" className="text-sm">
                Excel
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="format-csv"
                checked={formats.includes("csv")}
                onCheckedChange={() => handleFormatChange("csv")}
              />
              <Label htmlFor="format-csv" className="text-sm">
                CSV
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Recipients</Label>
          <div className="space-y-2">
            {recipients.map((email) => (
              <div key={email} className="flex items-center justify-between rounded-md border p-2">
                <span className="text-sm">{email}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRecipient(email)}
                  className="h-8 w-8 p-0"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add recipient email"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleAddRecipient} className="gap-1">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <Button type="submit" className="gap-1">
        Schedule Report
      </Button>
    </form>
  )
}
