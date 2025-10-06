"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function BudgetReportChart() {
  const data = [
    {
      name: "Ward 1",
      allocated: 25000000,
      spent: 10000000,
      remaining: 15000000,
    },
    {
      name: "Ward 2",
      allocated: 18000000,
      spent: 12000000,
      remaining: 6000000,
    },
    {
      name: "Ward 3",
      allocated: 32000000,
      spent: 15000000,
      remaining: 17000000,
    },
    {
      name: "Ward 4",
      allocated: 21000000,
      spent: 18000000,
      remaining: 3000000,
    },
    {
      name: "Ward 5",
      allocated: 28000000,
      spent: 20000000,
      remaining: 8000000,
    },
    {
      name: "Ward 6",
      allocated: 15000000,
      spent: 10000000,
      remaining: 5000000,
    },
    {
      name: "Ward 7",
      allocated: 20000000,
      spent: 5000000,
      remaining: 15000000,
    },
  ]

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`} />
          <Tooltip
            formatter={(value) => [`₹${((value as number) / 10000000).toFixed(2)} Cr`, ""]}
            labelFormatter={(label) => `Ward: ${label}`}
          />
          <Legend />
          <Bar dataKey="allocated" name="Budget Allocated" fill="#3b82f6" />
          <Bar dataKey="spent" name="Budget Spent" fill="#10b981" />
          <Bar dataKey="remaining" name="Budget Remaining" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
