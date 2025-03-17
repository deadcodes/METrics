"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { getRarityColor } from "@/lib/visualization-utils"
import type { ItemDetail } from "@/lib/types"

interface ItemDistributionChartProps {
  data: Array<{
    itemId: string
    percentage: number
    quantity: number
  }>
  itemDetails?: Record<string, ItemDetail>
}

export function ItemDistributionChart({ data, itemDetails = {} }: ItemDistributionChartProps) {
  const [chartData, setChartData] = useState(data)

  useEffect(() => {
    // Add rarity information to the chart data if itemDetails are available
    if (Object.keys(itemDetails).length > 0) {
      const enhancedData = data.map((item) => ({
        ...item,
        rarity: itemDetails[item.itemId]?.rarity || "Unknown",
        name: itemDetails[item.itemId]?.name || `Item ${item.itemId}`,
      }))
      setChartData(enhancedData)
    } else {
      setChartData(data)
    }
  }, [data, itemDetails])

  if (!data.length) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  // Vibrant colors for the pie chart
  const COLORS = [
    "#FF6384", // Pink
    "#36A2EB", // Blue
    "#FFCE56", // Yellow
    "#4BC0C0", // Teal
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#8AC926", // Green
    "#F94144", // Red
    "#1982C4", // Darker Blue
    "#6A4C93", // Violet
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{data.name || `Item ${data.itemId}`}</p>
          <p className="text-sm">Quantity: {data.quantity} items</p>
          <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
          {data.rarity && <p className="text-sm">Rarity: {data.rarity}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="quantity"
            nameKey="itemId"
            label={({ itemId, percentage }) => `${itemId}: ${percentage.toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.rarity ? getRarityColor(entry.rarity) : COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

