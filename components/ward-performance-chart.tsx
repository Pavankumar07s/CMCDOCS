"use client"

import useSWR from "swr"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function WardPerformanceChart() {
  const { data, isLoading } = useSWR("/api/admin/dashboard", fetcher, { refreshInterval: 10000 })
  const chartData = data?.wardPerformance || []

  if (isLoading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        No data available.
      </div>
    )
  }

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completion" name="Completion (%)" fill="#3b82f6" />
          <Bar dataKey="budget" name="Budget Utilization (%)" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
