import { Clock, Coins, FileText, Package, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HydratedLogEntry } from "@/lib/types"
import { calculateTotalHours, calculateValuePerHour, convertToAbbreviation } from "@/lib/data-transforms"
import { Skeleton } from "./ui/skeleton"
import { useEffect, useState } from "react"

interface MetricsOverviewProps {
  data: {
    totalEntries: number
    uniqueItems: number
    goldValue: number
    lastUpdated: string
  }
  entries: HydratedLogEntry[]
}

export function MetricsOverview({ data, entries }: MetricsOverviewProps) {
  const [valuePerHour, setValuePerHour] = useState<number>(0)
  const [loading, setIsLoading] = useState<boolean>(true)
  useEffect(() => {
    setIsLoading(true)
    try {
      // Calculate value per hour
      const vph = calculateValuePerHour(entries)
      setValuePerHour(vph)
    } catch (error) {
      console.error("Error calculating value per hour:", error)
    } finally {
      setIsLoading(false)
    }
  }, [entries])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        {loading ? (
          <div className="flex space-x-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-full ml-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : (
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEntries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Log entries processed</p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        {loading ? (
          <div className="flex space-x-4">
            <Skeleton className="h-12 w-12 rounded-full ml-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : (
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueItems}</div>
            <p className="text-xs text-muted-foreground">Unique item IDs</p>
          </CardContent>
        )}

      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Runtime</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        {loading ? (
          <div className="flex space-x-4">
            <Skeleton className="h-12 w-12 rounded-full ml-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : (
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalHours(entries)}</div>
            <p className="text-xs text-muted-foreground">Duration of logs found. 15 minutes resolution</p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GP Per Hour</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        {loading ? (
          <div className="flex space-x-4">
            <Skeleton className="h-12 w-12 rounded-full ml-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : (
          <CardContent>
            <div className="text-2xl font-bold">{convertToAbbreviation(valuePerHour)}</div>
            <p className="text-xs text-muted-foreground">Based on G.E value</p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Last Refreshed</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        {loading ? (
          <div className="flex space-x-4">
            <Skeleton className="h-12 w-12 rounded-full ml-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : (
          <CardContent>
            <div className="text-2xl font-bold">{new Date(data.lastUpdated).toLocaleTimeString()}</div>
            {/* <p className="text-xs text-muted-foreground">{data?.length}</p> */}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

