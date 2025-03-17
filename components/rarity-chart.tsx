"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { getRarityColor } from "@/lib/data-transforms"
import type { HydratedLogEntry } from "@/lib/types"
import type ApexCharts from "apexcharts"

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface RarityChartProps {
  entries: HydratedLogEntry[]
}

export function RarityChart({ entries }: RarityChartProps) {
  const [chartData, setChartData] = useState<any>({ series: [], labels: [] })
  const [activeRarity, setActiveRarity] = useState<string | null>(null)

  useEffect(() => {
    if (!entries.length) {
      setChartData({ series: [], labels: [] })
      return
    }

    // Group by rarity
    const rarityGroups: Record<
      string,
      { count: number; items: Array<{ id: number; name: string; quantity: number }> }
    > = {}

    // Group entries by item ID first
    const itemQuantities = new Map<number, { quantity: number; item: any }>()

    for (const entry of entries) {
      const existing = itemQuantities.get(entry.itemId)
      if (existing) {
        existing.quantity += entry.quantity
      } else {
        itemQuantities.set(entry.itemId, {
          quantity: entry.quantity,
          item: entry.item,
        })
      }
    }

    // Group by rarity
    for (const [itemId, data] of itemQuantities.entries()) {
      const rarity = data.item.rarity || "Unknown"

      if (!rarityGroups[rarity]) {
        rarityGroups[rarity] = { count: 0, items: [] }
      }

      rarityGroups[rarity].count += data.quantity
      rarityGroups[rarity].items.push({
        id: itemId,
        name: data.item.name || `Item ${itemId}`,
        quantity: data.quantity,
      })
    }

    // Convert to chart data format
    const series = Object.values(rarityGroups).map((group) => group.count)
    const labels = Object.keys(rarityGroups)

    setChartData({
      series,
      labels,
      rarityGroups,
    })
  }, [entries])

  if (chartData.series.length === 0) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  // Generate colors based on rarity
  const colors = chartData.labels.map((rarity: string) => getRarityColor(rarity))

  // Configure ApexCharts options
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      events: {
        dataPointMouseEnter: (event, chartContext, config) => {
          const rarity = chartData.labels[config.dataPointIndex]
          setActiveRarity(rarity)
        },
        dataPointMouseLeave: () => {
          setActiveRarity(null)
        },
      },
    },
    colors: colors,
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 4,
        columnWidth: "70%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    xaxis: {
      categories: chartData.labels,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Quantity",
        rotate: -90,
        offsetX: -10,
      },
      labels: {
        formatter: (value) => {
          if (value === 0) return "0"
          if (value < 1000) return value.toString()
          if (value < 1000000) return `${(value / 1000).toFixed(1)}K`
          return `${(value / 1000000).toFixed(1)}M`
        },
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const rarity = chartData.labels[dataPointIndex]
        const count = series[dataPointIndex]
        const items = chartData.rarityGroups[rarity].items

        let itemsHtml = ""
        items.slice(0, 5).forEach((item) => {
          itemsHtml += `<li class="text-xs">${item.name} × ${item.quantity.toLocaleString()}</li>`
        })

        if (items.length > 5) {
          itemsHtml += `<li class="text-xs">...and ${items.length - 5} more</li>`
        }

        return `
          <div class="apexcharts-tooltip-custom p-2 bg-background border rounded-md shadow-md">
            <p class="font-medium">${rarity}</p>
            <p class="text-sm">Total: ${count.toLocaleString()} items</p>
            <div class="mt-2">
              <p class="text-xs font-medium">Items:</p>
              <ul class="text-xs">
                ${itemsHtml}
              </ul>
            </div>
          </div>
        `
      },
      theme: "dark",
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 200,
          },
        },
      },
    ],
  }

  return (
    <div className="h-[200px] w-full">
      <ReactApexChart options={options} series={[{ data: chartData.series }]} type="bar" height="100%" width="100%" />
    </div>
  )
}

