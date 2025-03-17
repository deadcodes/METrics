"use client"

import { useState, useEffect } from "react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { getRarityColor } from "@/lib/visualization-utils"
import type { ItemDetail } from "@/lib/types"

interface MetricsRadarChartProps {
  items: Array<{ itemId: string; quantity: number }>
  itemDetails: Record<string, ItemDetail>
}

export function MetricsRadarChart({ items, itemDetails }: MetricsRadarChartProps) {
  const [radarData, setRadarData] = useState<Array<any>>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    if (!items.length || Object.keys(itemDetails).length === 0) {
      setRadarData([])
      setSelectedItems([])
      return
    }

    // Select top 5 items by quantity for comparison
    const topItems = [...items]
      .filter((item) => itemDetails[item.itemId]) // Only include items with details
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((item) => item.itemId)

    setSelectedItems(topItems)

    if (topItems.length === 0) {
      setRadarData([])
      return
    }

    // Prepare data for radar chart
    const metrics = ["value", "quantity", "totalValue"]
    const data = metrics.map((metric) => {
      const metricData: any = { metric }

      topItems.forEach((itemId) => {
        if (itemDetails[itemId]) {
          const item = items.find((i) => i.itemId === itemId)
          const detail = itemDetails[itemId]

          switch (metric) {
            case "value":
              metricData[detail.name] = detail.value
              break
            case "quantity":
              metricData[detail.name] = item ? item.quantity : 0
              break
            case "totalValue":
              metricData[detail.name] = item ? item.quantity * detail.value : 0
              break
          }
        }
      })

      return metricData
    })

    setRadarData(data)
  }, [items, itemDetails])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{payload[0].payload.metric}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center mt-1">
              <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm">
                {entry.name}: {entry.value}
              </p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (radarData.length === 0 || selectedItems.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={150} data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {selectedItems.map((itemId, index) => {
            const detail = itemDetails[itemId]
            if (!detail) return null

            return (
              <Radar
                key={`radar-${index}`}
                name={detail.name}
                dataKey={detail.name}
                stroke={getRarityColor(detail.rarity)}
                fill={getRarityColor(detail.rarity)}
                fillOpacity={0.3}
              />
            )
          })}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

