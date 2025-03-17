"use client"

import { Line, XAxis, CartesianGrid, YAxis, Area, ComposedChart, Scatter } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip } from "./ui/chart"
import { HydratedLogEntry, ItemDBRow, ItemValue } from "@/lib/types"
import { formatRare, formatDate } from "@/lib/data-transforms"

interface TimeSeriesChartProps {
  data: HydratedLogEntry[]
  timeRange?: string // Optional time range for filtering
}

const chartConfig = {} satisfies ChartConfig

const INTERVAL = 5 * 60 // 5 minutes in seconds

// Format y-axis ticks for better readability
const formatYAxisTick = (value: number) => {
  if (value === 0) return "0"
  if (value < 10) return value.toFixed(1)
  if (value < 1000) return value.toFixed(0)
  if (value < 1000000) return `${(value / 1000).toFixed(1)}K`
  return `${(value / 1000000).toFixed(1)}M`
}

const formatYAxisTickAny = (value: number[] | number | any) => {
  if (value.name) {
    return formatRare(value)
  }
  // if(typeof value === "object") return formatRare(value)
  if (typeof value === "number") return formatYAxisTick(value)
  return value.map(d => formatYAxisTick(d)).join('~')
}

const buildTooltipDrops = (data: any) => {
  if (data[0]?.payload?.items) {
    for (let item in data[0].payload.items) {
      <li>{item}</li>
    }
    return (
      <ul className="p-2">
        {data[0].payload.items.map(d => <li>{d}</li>)}
      </ul>
    )
  }
  return ``
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background rounded-md shadow-md p-3">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center mt-1">
            <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm">
              {entry.name}: {formatYAxisTickAny(entry.value)}
            </p>
          </div>
        ))}
        <div className="p-2">
          <p>Drops</p>
          {buildTooltipDrops(payload)}
        </div>
      </div>
    )
  }
  return null
}

const CustomizedDot = (props) => {
  const { cx, cy, stroke, payload, value } = props;
  if (props.payload.rare || props.payload.value > 5000000) {
    return (
      <svg x={cx - 20} y={cy - 20} width={40} height={40} fill="#CC1B41" viewBox="0 0 1024 1024">
        <g id="SVGRepo_bgCarrier" stroke-width="0" />
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
        <g id="SVGRepo_iconCarrier">
          <path d="M804.6 473.9v292.6c0 21.9-17.8 39.7-39.7 39.7H259.7c-21.9 0-39.7-17.8-39.7-39.7V473.9h-18.8c-21.9 0-39.7-17.8-39.7-39.7v-68.3c0-21.9 17.8-39.7 39.7-39.7h622.1c21.9 0 39.7 17.8 39.7 39.7v68.3c0 21.9-17.8 39.7-39.7 39.7h-18.7z" fill="#CC1B41" />
          <path d="M764.9 832.7H259.7c-36.5 0-66.2-29.7-66.2-66.2V499.9c-32.9-3.8-58.5-31.9-58.5-65.7v-68.3c0-36.5 29.7-66.2 66.2-66.2h622.1c36.5 0 66.2 29.7 66.2 66.2v68.3c0 33.9-25.6 61.9-58.5 65.7v266.6c0.1 36.5-29.6 66.2-66.1 66.2z m-563.7-480c-7.3 0-13.2 5.9-13.2 13.2v68.3c0 7.3 5.9 13.2 13.2 13.2h45.2v319.1c0 7.3 5.9 13.2 13.2 13.2h505.3c7.3 0 13.2-5.9 13.2-13.2V447.4h45.2c7.3 0 13.2-5.9 13.2-13.2v-68.3c0-7.3-5.9-13.2-13.2-13.2H201.2z" fill="#333333" />
          <path d="M473.3 492.3h78v295.4h-78z" fill="#CC1B41" />
          <path d="M239.5 447.4h545.6v51.7H239.5z" fill="#333333" />
          <path d="M305.751 228.226l19.659-11.35c15.502-8.95 35.246-3.952 44.665 11.163l41.115 66.213-104.068 2.35-13.486-23.16c-9.237-15.799-3.82-36.016 11.979-45.252 0.05 0.086 0.05 0.086 0.136 0.036z" fill="#CC1B41" />
          <path d="M277.11 350.417l-29.174-50.129c-23.786-41-9.93-93.801 31.069-117.588l0.26-0.15 19.658-11.35c40.444-23.35 91.48-10.553 116.078 29.053l90.15 144.944-228.041 5.22z m28.641-122.19l-0.346 0.2c-15.539 9.086-20.906 29.39-11.806 45.151l13.437 23.073 104.154-2.399-41.115-66.213c-9.52-15.288-29.163-20.113-44.665-11.163l-19.659 11.35zM414.8 492.3h58.5v295.4h-58.5zM551.3 492.3h58.5v295.4h-58.5z" fill="#333333" />
          <path d="M716.76 228.266l-19.66-11.35c-15.501-8.95-35.245-3.952-44.665 11.163l-41.115 66.213 104.068 2.349 13.437-23.073c9.237-15.798 3.82-36.015-11.979-45.252l-0.086-0.05z" fill="#CC1B41" />
          <path d="M745.364 350.32l-228.041-5.22 90.15-144.943c24.649-39.694 75.634-52.404 116.078-29.054l20.611 11.9c19.509 11.61 33.455 30.054 39.262 51.997 5.88 22.217 2.787 45.373-8.8 65.241l-29.26 50.08zM611.27 294.38l104.068 2.349 13.487-23.16c4.4-7.62 5.655-16.596 3.386-25.065-2.22-8.556-7.707-15.65-15.278-20.137l-19.832-11.45c-15.589-9-35.196-4.039-44.666 11.163l-41.165 66.3z" fill="#333333" />
        </g>
      </svg>
    );
  }

  return (
    <svg />
  );
};

export function IncomeOverTime({ data }: TimeSeriesChartProps) {
  const timeMap = new Map<number, ItemValue>()
  for (const entry of data) {
    const detail = entry.item
    if (!detail) continue
    if (detail.id === 0) continue

    const rarity = detail.rarity || "Unknown"
    // Round timestamp down to nearest 5-minute interval
    const timestamp = Math.floor(entry.timestamp / INTERVAL) * INTERVAL

    if (!timeMap.has(timestamp)) {
      timeMap.set(timestamp, { range: [9999999, 0], value: 0, records: 0, average: 0, rare: undefined, items: [] })
    }

    let timeMapData = timeMap.get(timestamp)!
    const itemValue = entry.quantity * detail.price
    // console.log('value', itemValue, detail)
    if (detail.rarity === 'Orange' || detail.rarity === 'Purple') {
      timeMapData.rare = { x: itemValue, y: itemValue, z: itemValue, name: detail.name.toUpperCase() }
    }
    if (!timeMapData.items.includes(detail.name)) {
      timeMapData.items.push(detail.name)
    }
    timeMapData.range[0] = timeMapData.range[0] < itemValue ? timeMapData.range[0] : itemValue
    timeMapData.range[1] = timeMapData.range[1] > itemValue ? timeMapData.range[1] : itemValue
    timeMapData.value = timeMapData.value + itemValue
    timeMapData.records += 1
    timeMapData.average = Math.floor(timeMapData.value / timeMapData.records)
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

  return (
    <ChartContainer config={chartConfig}>
      <ComposedChart
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
          label={{ value: "Time", position: 'insideBottom', offset: 20 }}
        />
        <YAxis
          scale="log"
          domain={["auto", "auto"]}
          tickFormatter={formatYAxisTick}
          label={{ value: "Income (log scale)", angle: -90, position: "insideLeft" }}
        />
        <ChartTooltip cursor={false} content={<CustomTooltip />} />
        <Line
          dataKey="average"
          type="monotone"
          stroke="#cc1b41"
          connectNulls
          strokeWidth={2}
          dot={<CustomizedDot />}
        />
        <Area
          type="monotone"
          dataKey="range"
          stroke="none"
          fill="#cccccc7a"
          connectNulls
          dot={false}
          activeDot={false}
        />
        <Scatter dataKey="rare" fill="orange" strokeWidth={2} />
      </ComposedChart>
    </ChartContainer>
  )
}
