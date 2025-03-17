"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { ValueQuantityScatter } from "@/components/value-quantity-scatter"
import { StackedAreaChart } from "@/components/stacked-area-chart"
import { ItemTreemap } from "@/components/item-treemap"
import { MetricsRadarChart } from "@/components/metrics-radar-chart"
import { getAllItemDetails } from "@/lib/item-utils"
import type { LogEntry, ItemDetail } from "@/lib/types"

interface AdvancedVisualizationsProps {
  timeSeriesData: Array<{
    timestamp: number
    formattedTime: string
    totalQuantity: number
  }>
  itemQuantities: Array<{
    itemId: string
    quantity: number
  }>
  itemDistribution: Array<{
    itemId: string
    percentage: number
    quantity: number
  }>
  rawEntries: LogEntry[]
}

export function AdvancedVisualizations({
  timeSeriesData,
  itemQuantities,
  itemDistribution,
  rawEntries,
}: AdvancedVisualizationsProps) {
  const [itemDetails, setItemDetails] = useState<Record<string, ItemDetail>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadItemDetails() {
      setIsLoading(true)
      try {
        const itemIds = itemQuantities.map((item) => item.itemId)
        const details = await getAllItemDetails(itemIds)
        setItemDetails(details)
      } catch (error) {
        console.error("Error loading item details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItemDetails()
  }, [itemQuantities])

  if (isLoading) {
    return <div className="p-8 text-center">Loading advanced visualizations...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="patterns">
        <TabsList className="mb-4">
          <TabsTrigger value="patterns">Activity Patterns</TabsTrigger>
          <TabsTrigger value="relationships">Data Relationships</TabsTrigger>
          <TabsTrigger value="hierarchical">Hierarchical View</TabsTrigger>
          <TabsTrigger value="comparison">Item Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <ActivityHeatmap entries={rawEntries} />
          <StackedAreaChart entries={rawEntries} itemDetails={itemDetails} />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <ValueQuantityScatter items={itemQuantities} itemDetails={itemDetails} />
        </TabsContent>

        <TabsContent value="hierarchical" className="space-y-6">
          <ItemTreemap items={itemQuantities} itemDetails={itemDetails} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <MetricsRadarChart items={itemQuantities} itemDetails={itemDetails} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

