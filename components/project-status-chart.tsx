"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"]

export function ProjectStatusChart({ data }: { data: any[] }) {
  if (!data) return <div>loading...</div>;
  const filtered = data.filter(d => d.value > 0);

  if (!filtered.length) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {filtered.map((_entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value} projects`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

