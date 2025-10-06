"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ProjectProgressChartProps {
  projectId: string
}

export function ProjectProgressChart({ projectId }: ProjectProgressChartProps) {
  // In a real app, this data would be fetched based on the projectId
  const progressData = [
    { month: "Jan", completion: 0, budget: 0 },
    { month: "Feb", completion: 10, budget: 15 },
    { month: "Mar", completion: 25, budget: 30 },
    { month: "Apr", completion: 40, budget: 45 },
    { month: "May", completion: 65, budget: 65 },
    { month: "Jun", completion: 85, budget: 80 },
    { month: "Jul", completion: 100, budget: 98 },
  ]

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="completion"
            name="Completion (%)"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="budget"
            name="Budget Utilization (%)"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
