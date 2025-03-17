"use client"

import { useState, useEffect } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceArea,
} from "recharts"
import type { LogEntry, ItemDetail, HydratedLogEntry } from "@/lib/types"
import { getRarityColor } from "@/lib/item-utils"
const INTERVAL = 5 * 60 // 5 minutes in seconds

interface RarityTimeSeriesChartProps {
    data: HydratedLogEntry[]
    timeRange?: string // Optional time range for filtering
}

export function RarityTimeSeriesChart({ data: entries }: RarityTimeSeriesChartProps) {
    // console.log('data', entries)
    const [chartData, setChartData] = useState<Array<any>>([])
    const [rarities, setRarities] = useState<string[]>([])
    const [refAreaLeft, setRefAreaLeft] = useState<string>("")
    const [refAreaRight, setRefAreaRight] = useState<string>("")
    const [zoomedData, setZoomedData] = useState<Array<any>>([])
    const [isZoomed, setIsZoomed] = useState<boolean>(false)

    // Process data for the chart
    useEffect(() => {
        if (!entries.length) {
            setChartData([])
            setRarities([])
            setZoomedData([])
            return
        }

        // Group entries by timestamp and rarity
        const timeRarityMap = new Map<number, Record<string, number>>()
        const uniqueRarities = new Set<string>()
    // Define 5-minute interval in seconds
        // Process each entry
        for (const entry of entries) {
            const detail = entry.item

            if (!detail) continue

            const rarity = detail.rarity || "Unknown"
            uniqueRarities.add(rarity)
      // Round timestamp down to nearest 5-minute interval
            const timestamp = Math.floor(entry.timestamp / INTERVAL) * INTERVAL

            if (!timeRarityMap.has(timestamp)) {
                timeRarityMap.set(timestamp, {})
            }

            const timeData = timeRarityMap.get(timestamp)!
            timeData[rarity] = (timeData[rarity] || 0) + (entry.quantity * detail.price)
        }

        // Convert to array format for chart
        const data = Array.from(timeRarityMap.entries())
            .map(([timestamp, rarityData]) => {
                const formattedTime = new Date(timestamp * 1000).toDateString()

                return {
                    timestamp,
                    formattedTime,
                    ...rarityData,
                }
            })
            .sort((a, b) => a.timestamp - b.timestamp)

        setChartData(data)
        setZoomedData(data)
        console.log('uniqueRarities', uniqueRarities, data)
        setRarities(Array.from(uniqueRarities))
    }, [entries])

    // Handle zoom functionality
    const zoom = () => {
        if (refAreaLeft === refAreaRight || refAreaRight === "") {
            setRefAreaLeft("")
            setRefAreaRight("")
            return
        }

        // Ensure left is always less than right
        const indexLeft = chartData.findIndex((d) => d.formattedTime === refAreaLeft)
        const indexRight = chartData.findIndex((d) => d.formattedTime === refAreaRight)

        const [startIndex, endIndex] = indexLeft <= indexRight ? [indexLeft, indexRight] : [indexRight, indexLeft]

        const zoomed = chartData.slice(startIndex, endIndex + 1)

        setZoomedData(zoomed)
        setIsZoomed(true)
        setRefAreaLeft("")
        setRefAreaRight("")
    }

    const resetZoom = () => {
        setZoomedData(chartData)
        setIsZoomed(false)
    }

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // Calculate total for this timestamp
            const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0)

            return (
                <div className="bg-background border rounded-md shadow-md p-3">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={`tooltip-${index}`} className="flex items-center mt-1">
                            <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <p className="text-sm">
                                {entry.name}: {formatYAxisTick(entry.value)}
                            </p>
                        </div>
                    ))}
                    <p className="text-sm font-medium mt-2">Total: {formatYAxisTick(total)}</p>
                </div>
            )
        }
        return null
    }

    // Format y-axis ticks for better readability
    const formatYAxisTick = (value: number) => {
        if (value === 0) return "0"
        if (value < 10) return value.toFixed(1)
        if (value < 1000) return value.toFixed(0)
        if (value < 1000000) return `${(value / 1000).toFixed(1)}K`
        return `${(value / 1000000).toFixed(1)}M`
    }

    if (chartData.length === 0 || rarities.length === 0) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
                No data available for the selected time range
            </div>
        )
    }

    return (
        <div className="h-[400px] w-full">
            <div className="flex justify-between items-center mb-2">
                {isZoomed && (
                    <button
                        onClick={resetZoom}
                        className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                    >
                        Reset Zoom
                    </button>
                )}
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                    data={zoomedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                    onMouseDown={(e) => e && e.activeLabel && setRefAreaLeft(e.activeLabel)}
                    onMouseMove={(e) => e && e.activeLabel && refAreaLeft && setRefAreaRight(e.activeLabel)}
                    onMouseUp={zoom}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="formattedTime"
                        allowDataOverflow
                        label={{ value: "Time", position: "insideBottomRight", offset: -10 }}
                    />
                    <YAxis
                        scale="log"
                        domain={["auto", "auto"]}
                        allowDataOverflow
                        tickFormatter={formatYAxisTick}
                        label={{ value: "Quantity (log scale)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />

                    {rarities.map((rarity, index) => {
                        return (
                            <Line
                            key={`line-${index}`}
                            dataKey={rarity}
                            name={rarity}
                            stroke={getRarityColor(rarity)}
                            dot={{ r: 0 }}
                            activeDot={{ r: 3 }}
                            strokeWidth={1}
                            />
                        )
                    }
                    )
                }

                    {refAreaLeft && refAreaRight && (
                        <ReferenceArea
                            x1={refAreaLeft}
                            x2={refAreaRight}
                            strokeOpacity={0.3}
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground mt-2">
                <p>Drag to zoom: Click and drag horizontally to zoom into a specific time period</p>
            </div>
        </div>
    )
}

