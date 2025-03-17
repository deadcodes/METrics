"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RequestsChartProps {
  data: Array<{
    timestamp: string
    count: number
  }>
}

export function RequestsChart({ data }: RequestsChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

