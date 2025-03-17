"use client"

import { useState, useEffect } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getValueQuantityData, getValueQuantityCorrelation, getRarityColor } from "@/lib/visualization-utils"
import type { ItemDetail } from "@/lib/types"

interface ValueQuantityScatterProps {
  items: Array<{ itemId: string; quantity: number }>
  itemDetails: Record<string, ItemDetail>
}

export function ValueQuantityScatter({ items, itemDetails }: ValueQuantityScatterProps) {
  const [scatterData, setScatterData] = useState<Array<any>>([])
  const [correlation, setCorrelation] = useState<number>(0)

  useEffect(() => {
    if (!items.length || Object.keys(itemDetails).length === 0) {
      setScatterData([])
      setCorrelation(0)
      return
    }

    const data = getValueQuantityData(items)

    // Filter out any items with undefined values
    const validData = data.filter(
      (item) => item.value !== undefined && item.quantity !== undefined && item.rarity !== undefined,
    )

    // Group data by rarity for separate scatter plots
    const groupedData = validData.reduce(
      (acc, item) => {
        const rarity = item.rarity || "Unknown"
        if (!acc[rarity]) {
          acc[rarity] = []
        }
        acc[rarity].push(item)
        return acc
      },
      {} as Record<string, Array<any>>,
    )

    setScatterData(
      Object.entries(groupedData).map(([rarity, items]) => ({
        name: rarity,
        data: items,
        color: getRarityColor(rarity),
      })),
    )

    setCorrelation(getValueQuantityCorrelation(items))
  }, [items, itemDetails])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Value: {data.value}</p>
          <p className="text-sm">Quantity: {data.quantity}</p>
          <p className="text-sm">Rarity: {data.rarity}</p>
        </div>
      )
    }
    return null
  }

  if (scatterData.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  return (
    <div className="h-[350px] w-full">
      <div className="flex justify-end mb-2">
        <div className="text-right">
          <p className="text-sm font-medium">Correlation: {correlation.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {correlation > 0.7
              ? "Strong positive"
              : correlation > 0.3
                ? "Moderate positive"
                : correlation > -0.3
                  ? "Weak/No correlation"
                  : correlation > -0.7
                    ? "Moderate negative"
                    : "Strong negative"}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 40,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="value"
            name="Value"
            domain={["dataMin - 100", "dataMax + 100"]}
            label={{ value: "Item Value", position: "bottom", offset: 20 }}
          />
          <YAxis
            type="number"
            dataKey="quantity"
            name="Quantity"
            domain={["dataMin - 1", "dataMax + 2"]}
            label={{ value: "Quantity Collected", angle: -90, position: "left", offset: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {scatterData.map((entry, index) => (
            <Scatter key={`scatter-${index}`} name={entry.name} data={entry.data} fill={entry.color} shape="circle" />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

