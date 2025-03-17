"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { transformIncomeTrendData, formatLargeNumber, formatDateForTooltip } from "@/lib/data-transforms"
import type { HydratedLogEntry } from "@/lib/types"
import type ApexCharts from "apexcharts"

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface IncomeTrendChartProps {
  entries: HydratedLogEntry[]
  timeRange?: string // Optional time range for filtering
}

export function IncomeTrendChart({ entries, timeRange }: IncomeTrendChartProps) {
  const [chartData, setChartData] = useState<any>({ series: [], annotations: { points: [] } })
  const [isZoomed, setIsZoomed] = useState<boolean>(false)
  const chartRef = useRef<any>(null)

  // Process data for the chart
  useEffect(() => {
    const transformedData = transformIncomeTrendData(entries)
    setChartData(transformedData)
    setIsZoomed(false)
  }, [entries])

  const resetZoom = () => {
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.resetSeries(false)
      chartRef.current.chart.zoomX.reset()
      setIsZoomed(false)
    }
  }

  // Handle zoom events
  const handleZoom = (chartContext: any, { xaxis }: any) => {
    setIsZoomed(true)
  }

  if (chartData.series.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        No data available for the selected time range
      </div>
    )
  }

  // Configure ApexCharts options
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 400,
      fontFamily: "inherit",
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
      events: {
        zoomed: handleZoom,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    colors: ["hsl(var(--primary))"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
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
    markers: {
      size: 4,
      strokeWidth: 0,
      hover: {
        size: 7,
      },
    },
    annotations: chartData.annotations,
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        formatter: (value, timestamp, opts) =>
          new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      title: {
        text: "Time",
        offsetY: 80,
      },
    },
    yaxis: {
      logarithmic: true,
      logBase: 10,
      title: {
        text: "Income (log scale)",
        rotate: -90,
        offsetX: -10,
      },
      labels: {
        formatter: (value) => formatLargeNumber(value),
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => value.toLocaleString() + " gold",
      },
      x: {
        formatter: (value) => formatDateForTooltip(value),
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
          annotations: {
            points: [], // Hide annotations on mobile for clarity
          },
        },
      },
    ],
  }

  return (
    <div className="h-[400px] w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Income Trend Over Time (Log Scale)</h3>
        {isZoomed && (
          <button
            onClick={resetZoom}
            className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
          >
            Reset Zoom
          </button>
        )}
      </div>
      <div className="h-[350px] w-full">
        <ReactApexChart
          ref={chartRef}
          options={options}
          series={chartData.series}
          type="line"
          height="100%"
          width="100%"
        />
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        <p>
          Markers indicate significant Epic/Legendary item drops. Use the zoom tools or drag to select a region to zoom.
        </p>
      </div>
    </div>
  )
}

