"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface ActivityData {
  date: string
  entries: number
  uniqueUsers: number
}

interface ActivityChartProps {
  data: ActivityData[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} stroke="hsl(var(--border))" />
        <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} stroke="hsl(var(--border))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
        <Line
          type="monotone"
          dataKey="entries"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Entries"
          dot={{ fill: "hsl(var(--primary))" }}
        />
        <Line
          type="monotone"
          dataKey="uniqueUsers"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          name="Unique Users"
          dot={{ fill: "hsl(var(--chart-2))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
