"use client"

import { useState, useEffect } from "react"
import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { getTreemapData, getRarityColor } from "@/lib/visualization-utils"
import type { ItemLog } from "@/lib/types"

interface ItemTreemapProps {
  items: ItemLog[]
}

export function ItemTreemap({ items }: ItemTreemapProps) {
  const [treemapData, setTreemapData] = useState<any>({ name: "root", children: [] })
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    if (!items || !items.length) {
      setTreemapData({ name: "root", children: [] })
      setHasData(false)
      return
    }

    try {
      const data = getTreemapData(items)
      setTreemapData({ name: "root", children: data })
      setHasData(data.length > 0 && data.some((group) => group.children && group.children.length > 0))
    } catch (error) {
      console.error("Error generating treemap data:", error)
      setTreemapData({ name: "root", children: [] })
      setHasData(false)
    }
  }, [items])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      // For parent nodes (rarity groups)
      if (data.children) {
        const totalValue = data.children.reduce((sum: number, child: any) => sum + (child.size || 0), 0)
        const itemCount = data.children.length

        return (
          <div className="bg-background border rounded-md shadow-md p-3">
            <p className="font-medium">{data.name || "Unknown"}</p>
            <p className="text-sm">Total Value: {totalValue.toLocaleString()}</p>
            <p className="text-sm">Items: {itemCount}</p>
          </div>
        )
      }

      // For leaf nodes (individual items)
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{data.name || "Unknown Item"}</p>
          <p className="text-sm">Total Value: {(data.size || 0).toLocaleString()}</p>
          <p className="text-sm">Rarity: {data.parent?.name || "Unknown"}</p>
        </div>
      )
    }
    return null
  }

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, rarity } = props

    // Skip rendering if dimensions are too small
    if (width < 1 || height < 1) return null

    // Determine color based on depth and rarity
    let fill
    if (depth === 1) {
      // Parent nodes (rarity groups)
      fill = getRarityColor(name)
    } else if (root && root.children && root.children[index]) {
      // Leaf nodes (individual items)
      fill = getRarityColor(root.children[index].name)
    } else {
      // Fallback
      fill = getRarityColor("Unknown")
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          fillOpacity={depth === 1 ? 0.8 : 0.6}
          stroke="hsl(var(--background))"
          strokeWidth={2}
          className="transition-opacity hover:opacity-80"
        />
        {width > 30 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--background))"
            fontSize={depth === 1 ? 14 : 10}
            fontWeight={depth === 1 ? "bold" : "normal"}
            className="pointer-events-none"
          >
            {name}
          </text>
        )}
      </g>
    )
  }

  if (!hasData) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="hsl(var(--background))"
          fill="hsl(var(--primary))"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Size represents total value (item value × quantity). Hover over sections for details.</p>
      </div>
    </div>
  )
}

