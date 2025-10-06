"use client"

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function CompletionRateChart() {
  const data = [
    { month: "Jan", planned: 10, actual: 8 },
    { month: "Feb", planned: 20, actual: 15 },
    { month: "Mar", planned: 35, actual: 30 },
    { month: "Apr", planned: 50, actual: 45 },
    { month: "May", planned: 65, actual: 60 },
    { month: "Jun", planned: 80, actual: 70 },
    { month: "Jul", planned: 90, actual: 85 },
    { month: "Aug", planned: 100, actual: 95 },
  ]

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value) => [`${value}%`, ""]} />
          <Legend />
          <Line
            type="monotone"
            dataKey="planned"
            name="Planned Completion"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Completion"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
