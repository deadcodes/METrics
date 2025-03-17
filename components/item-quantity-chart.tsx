"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { getRarityColor } from "@/lib/visualization-utils"
import type { ItemDetail } from "@/lib/types"

interface ItemQuantityChartProps {
  data: Array<{
    itemId: string
    quantity: number
  }>
  itemDetails?: Record<string, ItemDetail>
}

export function ItemQuantityChart({ data, itemDetails = {} }: ItemQuantityChartProps) {
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{data.name || `Item ID: ${data.itemId}`}</p>
          <p className="text-sm">Quantity: {data.quantity} items</p>
          {data.rarity && <p className="text-sm">Rarity: {data.rarity}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="itemId" label={{ value: "Item ID", position: "insideBottomRight", offset: -10 }} />
          <YAxis label={{ value: "Quantity", angle: -90, position: "insideLeft" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="quantity" name="Total Quantity" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.rarity ? getRarityColor(entry.rarity) : `hsl(var(--primary))`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

