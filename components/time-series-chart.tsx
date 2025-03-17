"use client"

import { LineChart, Line, XAxis, CartesianGrid, YAxis, Brush, Area } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { HydratedLogEntry } from "@/lib/types"

interface TimeSeriesChartProps {
  data: HydratedLogEntry[]
  timeRange?: string // Optional time range for filtering
}
interface ItemValue {
  range:number[]
  value:number
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const INTERVAL = 5 * 60 // 5 minutes in seconds

// Format y-axis ticks for better readability
const formatYAxisTick = (value: number) => {
  if (value === 0) return "0"
  if (value < 10) return value.toFixed(1)
  if (value < 1000) return value.toFixed(0)
  if (value < 1000000) return `${(value / 1000).toFixed(1)}K`
  return `${(value / 1000000).toFixed(1)}M`
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Calculate total for this timestamp
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0)

    return (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center mt-1">
            <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm">
              {entry.name}: {formatYAxisTick(entry.value)}
            </p>
          </div>
        ))}
        {/* <p className="text-sm font-medium mt-2">Total: {formatYAxisTick(total)}</p> */}
      </div>
    )
  }
  return null
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const timeMap = new Map<number,ItemValue>()
  const timeRarityMap = new Map<number, Record<string, number>>()
  for (const entry of data) {
    const detail = entry.item
    if (!detail) continue
    if(detail.id === 0) continue

    const rarity = detail.rarity || "Unknown"
    // Round timestamp down to nearest 5-minute interval
    const timestamp = Math.floor(entry.timestamp / INTERVAL) * INTERVAL

    if (!timeRarityMap.has(timestamp)) {
      timeRarityMap.set(timestamp, {})
      timeMap.set(timestamp,{range:[9999999,0],value:0})
    }

    let timeData = timeRarityMap.get(timestamp)!
    let timeMapData = timeMap.get(timestamp)!
    const itemValue = entry.quantity * detail.price
    // console.log('value', itemValue, detail)
    timeData['value'] = (timeData['value'] || 0) + (entry.quantity * detail.price)
    timeMapData.range[0] = timeMapData.range[0] < itemValue ? timeMapData.range[0] : itemValue
    timeMapData.range[1] = timeMapData.range[1] > itemValue ? timeMapData.range[1] : itemValue
    timeMapData.value = timeMapData.value + itemValue
  }

  // Convert to array format for chart
  const formattedData = Array.from(timeMap.entries())
    .map(([timestamp, rarityData]) => {
      const formattedTime = formatDate(new Date(timestamp * 1000));

      return {
        timestamp,
        formattedTime,
        ...rarityData,
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)

    console.log('formatted data', formattedData)
  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={formattedData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="formattedTime"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        // tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          scale="log"
          domain={["auto", "auto"]}
          allowDataOverflow
          tickFormatter={formatYAxisTick}
          label={{ value: "Income (log scale)", angle: -90, position: "insideLeft" }}
        />
        <ChartTooltip cursor={false} content={<CustomTooltip />} />
        <Line
          dataKey="value"
          type="monotone"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
                <Area
            dataKey="range"
            stroke="none"
            fill="#cccccc"
            connectNulls
            dot={false}
            activeDot={false}
        />
        {/* <Line
          dataKey="mobile"
          type="monotone"
          stroke="var(--color-mobile)"
          strokeWidth={2}
          dot={false}
        /> */}
        <Brush />
      </LineChart>
    </ChartContainer>
  )
}

