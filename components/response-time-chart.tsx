"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ResponseTimeChartProps {
  data: Array<{
    timestamp: string
    value: number
  }>
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

