"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function SystemHealthMonitor({ data }: { data: any }) {
  const health = data || { cpu: 0, memory: 0, storage: 0, status: "Unknown" }
  const chartData = [
    { time: "00:00", cpu: health.cpu, memory: health.memory, storage: health.storage },
    { time: "04:00", cpu: health.cpu, memory: health.memory, storage: health.storage },
    { time: "08:00", cpu: health.cpu, memory: health.memory, storage: health.storage },
    { time: "12:00", cpu: health.cpu, memory: health.memory, storage: health.storage },
    { time: "16:00", cpu: health.cpu, memory: health.memory, storage: health.storage },
    { time: "20:00", cpu: health.cpu, memory: health.memory, storage: health.storage },
    { time: "24:00", cpu: health.cpu, memory: health.memory, storage: health.storage },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{health.cpu}%</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {health.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{health.memory}%</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {health.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Storage Usage</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{health.storage}%</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {health.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Area type="monotone" dataKey="memory" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            <Area type="monotone" dataKey="storage" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* You can keep the static backup/status section or fetch from backend if available */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="mb-2 text-sm font-medium">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage Services</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Online
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-medium">Last Backup</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm">Today, 03:00 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <span className="text-sm">Today, 03:15 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Configuration</span>
              <span className="text-sm">Today, 03:30 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
