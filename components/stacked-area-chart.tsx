"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { transformStackedAreaData, getRarityColor, convertToAbbreviation, formatDate } from "@/lib/data-transforms"
import type { HydratedLogEntry } from "@/lib/types"
import type ApexCharts from "apexcharts"
import { ChartContainer } from "./ui/chart"

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface StackedAreaChartProps {
  entries: HydratedLogEntry[]
}

export function StackedAreaChart({ entries }: StackedAreaChartProps) {
  const [chartData, setChartData] = useState<any>({ series: [], categories: [], annotations: new Map<number, string>() })

  useEffect(() => {
    const transformedData = transformStackedAreaData(entries)
    setChartData(transformedData)
  }, [entries])

  if (chartData.series.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  // Generate colors based on rarity
  const colors = chartData.series.map((s: any) => getRarityColor(s.name))

  // Configure ApexCharts options
  const options: ApexCharts.ApexOptions = {
    annotations: {
      xaxis: []
    },
    chart: {
      id: "income",
      fontFamily: "inherit",
      foreColor: "#aaa19d",
      background: '#141210',
      type: "area",
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
      animations: {
        enabled: false,
      },
    },
    colors: colors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 1,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.3,
      },
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
      type: "datetime",
      axisTicks: { show: false },
      categories: chartData.categories,
      title: {
        text: "Time",
        style: {
          color: "#aaa19d",
          fontWeight: "400",
          fontSize: "16px"
        },
      },
      labels: {
        show: false,
      }
    },
    yaxis: {
      logarithmic: true,
      logBase: 10,
      title: {
        text: "Income",
        style: {
          color: "#aaa19d",
          fontWeight: "400",
          fontSize: "16px"
        },
        rotate: -90,
      },
      forceNiceScale: true,
      labels: {
        formatter: (value) => {
          if (value === 0) return "0"
          if (value < 1000) return value?.toString()
          if (value < 1000000) return `${(value / 1000).toFixed(1)}K`
          return `${(value / 1000000).toFixed(1)}M`
        },
      },
    },
    tooltip: {
      shared: true,
      followCursor: true,
      y: {
        formatter: (value) => convertToAbbreviation(value) + " GP",
      },
      x: {
        formatter: (value) => formatDate(new Date(value)),
      },
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 5,
      fontSize: "13px",
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: "bottom",
            offsetY: 0,
          },
        },
      },
    ],
  }
  options.annotations.xaxis! = chartData.annotations
  return (
    <ChartContainer config={{}}>
      <ReactApexChart options={options} series={chartData.series} type="area" height="100%" width="100%" />
    </ChartContainer>
  )
}

