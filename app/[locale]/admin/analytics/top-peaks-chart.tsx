"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface TopPeak {
  id: string
  name: string
  totalVisits: number
  uniqueVisitors: number
}

interface TopPeaksChartProps {
  data: TopPeak[]
}

export function TopPeaksChart({ data }: TopPeaksChartProps) {
  const chartData = data.slice(0, 8).map((peak) => ({
    name: peak.name.length > 15 ? peak.name.substring(0, 15) + "..." : peak.name,
    visits: peak.totalVisits,
    visitors: peak.uniqueVisitors,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Visits" />
      </BarChart>
    </ResponsiveContainer>
  )
}
