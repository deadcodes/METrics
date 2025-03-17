"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { transformActivityHeatmapData } from "@/lib/data-transforms"
import type { HydratedLogEntry } from "@/lib/types"
import type ApexCharts from "apexcharts"
import { ChartContainer } from "./ui/chart"
// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface ActivityHeatmapProps {
  data: HydratedLogEntry[]
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [chartData, setChartData] = useState<any>({ series: [], categories: { days: [], hours: [] } })

  useEffect(() => {
    const transformedData = transformActivityHeatmapData(data)
    setChartData(transformedData)
  }, [data])

  if (!data.length) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  // Configure ApexCharts options
  const options: ApexCharts.ApexOptions = {
    theme: { mode: "dark" },
    dataLabels: { enabled: false },
    legend: { show: false },
    chart: {
      type: "heatmap",
      fontFamily: "inherit",
      foreColor: "#aaa19d",
      background: '#141210',
      animations: { enabled: false },
    },
    plotOptions: {
      heatmap: {
        enableShades: true,
        radius: 0,
        useFillColorAsStroke: true,
        distributed: true,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: '#28231f' }
          ]
        }
      },
    },
    xaxis: {
      categories: chartData.categories.hours,
      type: 'category',
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        style: {
          colors: new Array(24).fill("#aaa19d")
        },
      },
      title: {
        text: "Hour of Day",
        style: {
          color: "#aaa19d",
          fontWeight: "400",
          fontSize: "16px"
        }
      },
    },
    yaxis: {
      labels: { style: { colors: new Array(24).fill("#aaa19d") } }
    },
    tooltip: {
      y: { formatter: (value) => (value === 1 ? "1 drop" : `${value} drops`) },
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
          },
          xaxis: {
            labels: {
              rotate: -45,
              style: {
                fontSize: "8px",
              },
            },
          },
        },
      },
    ],
  }

  return (
    <ChartContainer config={{}}>
      <ReactApexChart options={options} series={chartData.series} type="heatmap" height="100%" width="100%" />
    </ChartContainer>
  )
}

