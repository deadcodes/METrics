"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { HydratedLogEntry } from "@/lib/types"
import { convertToAbbreviation, getRarityColor } from "@/lib/data-transforms"
import { Coins } from "lucide-react"

interface ItemDetailsProps {
  entries: HydratedLogEntry[]
}

export function ItemDetails({ entries }: ItemDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [sortedItems, setSortedItems] = useState<
    Array<{
      id: number
      name: string
      price: number
      quantity: number
      rarity: string
      totalValue: number
    }>
  >([])

  useEffect(() => {
    async function processData() {
      setIsLoading(true)
      try {
        // Group by item ID and calculate quantities
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

        // Convert to array format
        const itemData = Array.from(itemQuantities.entries()).map(([itemId, data]) => ({
          id: itemId,
          name: data.item.name || `Item ${itemId}`,
          price: data.item.price || 0,
          quantity: data.quantity || 0,
          rarity: data.item.rarity || "Unknown",
          totalValue: (data.quantity || 0) * (data.item.price || 0),
        }))

        // Sort items by rarity (high to low) and then by total value (descending)
        const rarityOrder: Record<string, number> = {
          Legendary: 5,
          Epic: 4,
          Rare: 3,
          Uncommon: 2,
          Common: 1,
          Unknown: 0,
        }

        const sorted = [...itemData].sort((a, b) => {
          // First sort by rarity (high to low)
          const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0)
          if (rarityDiff !== 0) return rarityDiff

          // Then sort by total value (descending)
          return b.totalValue - a.totalValue
        })

        setSortedItems(sorted)
      } catch (error) {
        console.error("Error processing item details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    processData()
  }, [entries])

  function getRarityClassColor(rarity: string): string {
    switch (rarity.toLowerCase()) {
      case "white":
        return "text-gray-500"
      case "green":
        return "text-green-500"
      case "blue":
        return "text-blue-500"
      case "purple":
        return "text-purple-500"
      case "orange":
        return "text-amber-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top Items by Value</CardTitle>
          <CardDescription>Most valuable drops</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedItems.slice(0, 9).filter(d => d.price !== 0).map((item) => (
                <div key={item.id} className="flex items-center p-3 rounded-lg border">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mr-3">
                    <span className="text-xs">{item.id}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${getRarityClassColor(item.rarity)}`}>{item.name}</h4>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Qty: {convertToAbbreviation(item.quantity)}</span>
                      <span className={`font-medium ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Price: {convertToAbbreviation(item.price)}</span>
                      <span>Total: <span className={`font-medium ${getRarityClassColor(item.rarity)}`}>{convertToAbbreviation(item.totalValue)}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Item Inventory</CardTitle>
          <CardDescription>Details of all collected items</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedItems.filter(d => d.price !== 0).map((item) => (
                <div key={item.id} className="flex items-center p-3 rounded-lg border">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mr-3">
                  <span className="text-xs">{item.id}</span>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${getRarityClassColor(item.rarity)}`}>{item.name}</h4>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Qty: {convertToAbbreviation(item.quantity)}</span>
                    <span className={`font-medium ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Price: {convertToAbbreviation(item.price)}</span>
                    <span>Total: <span className={`font-medium ${getRarityClassColor(item.rarity)}`}>{convertToAbbreviation(item.totalValue)}</span></span>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
