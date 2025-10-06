"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"

export function WardComparisonChart() {
  const data = [
    { subject: "Budget Utilization", Ward1: 65, Ward2: 80, Ward3: 90, Ward4: 70, Ward5: 85 },
    { subject: "Completion Rate", Ward1: 70, Ward2: 75, Ward3: 85, Ward4: 60, Ward5: 90 },
    { subject: "Quality Score", Ward1: 80, Ward2: 85, Ward3: 75, Ward4: 90, Ward5: 70 },
    { subject: "Timeline Adherence", Ward1: 75, Ward2: 70, Ward3: 80, Ward4: 85, Ward5: 65 },
    { subject: "Contractor Performance", Ward1: 85, Ward2: 90, Ward3: 70, Ward4: 75, Ward5: 80 },
  ]

  return (
    <div className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Ward 1" dataKey="Ward1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <Radar name="Ward 2" dataKey="Ward2" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          <Radar name="Ward 3" dataKey="Ward3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
          <Radar name="Ward 4" dataKey="Ward4" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
          <Radar name="Ward 5" dataKey="Ward5" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
