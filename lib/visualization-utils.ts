import type { LogEntry, ItemDetail, ItemLog } from "./types"

// Process time data to get activity by hour of day
export function getActivityByHourOfDay(entries: LogEntry[]): Array<{ hour: string; count: number }> {
  const hourCounts = new Map<number, number>()

  // Initialize all hours with 0
  for (let i = 0; i < 24; i++) {
    hourCounts.set(i, 0)
  }

  // Count entries by hour
  for (const entry of entries) {
    const date = new Date(entry.timestamp * 1000)
    const hour = date.getHours()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
  }

  // Convert to array format for chart
  return Array.from(hourCounts.entries())
    .map(([hour, count]) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count,
    }))
    .sort((a, b) => Number.parseInt(a.hour) - Number.parseInt(b.hour))
}

// Process time data to get activity by day of week
export function getActivityByDayOfWeek(entries: LogEntry[]): Array<{ day: string; count: number }> {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayCounts = new Map<number, number>()

  // Initialize all days with 0
  for (let i = 0; i < 7; i++) {
    dayCounts.set(i, 0)
  }

  // Count entries by day
  for (const entry of entries) {
    const date = new Date(entry.timestamp * 1000)
    const day = date.getDay()
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
  }

  // Convert to array format for chart
  return Array.from(dayCounts.entries()).map(([day, count]) => ({
    day: dayNames[day],
    count,
  }))
}

// Process data for value vs quantity scatter plot
export function getValueQuantityData(
  items: ItemLog[],
): Array<{ itemId: string; name: string; value: number; quantity: number; rarity: string }> {
  return items
    .filter((item) => item && item.id !== undefined) // Filter out undefined items
    .map((item) => {
      return {
        itemId: item.id.toString(),
        name: item.name || `Item ${item.id}`,
        value: item.price || 0,
        quantity: item.quantity || 0,
        rarity: item.rarity || "Unknown",
      }
    })
}

// Process time series data by rarity
export function getTimeSeriesByRarity(
  entries: LogEntry[],
  itemDetails: Record<string, ItemDetail>,
): Array<{ timestamp: number; formattedTime: string; [key: string]: number | string }> {
  // Group entries by timestamp
  const timeMap = new Map<number, { [rarity: string]: number }>()

  for (const entry of entries) {
    const detail = itemDetails[entry.itemId.toString()]
    if (!detail) continue

    const rarity = detail.rarity
    if (!timeMap.has(entry.timestamp)) {
      timeMap.set(entry.timestamp, {})
    }

    const timeData = timeMap.get(entry.timestamp)!
    timeData[rarity] = (timeData[rarity] || 0) + entry.quantity
  }

  // Convert to array format for chart
  return Array.from(timeMap.entries())
    .map(([timestamp, rarityData]) => {
      const formattedTime = new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })

      return {
        timestamp,
        formattedTime,
        ...rarityData,
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)
}

// Get correlation between item value and quantity
export function getValueQuantityCorrelation(items: ItemLog[]): number {
  // Filter out items with undefined values
  const validItems = items.filter((item) => item && item.price !== undefined && item.quantity !== undefined)

  if (validItems.length <= 1) return 0

  const values = validItems.map((d) => d.price || 0)
  const quantities = validItems.map((d) => d.quantity || 0)

  const meanValue = values.reduce((sum, val) => sum + val, 0) / values.length
  const meanQuantity = quantities.reduce((sum, val) => sum + val, 0) / quantities.length

  let numerator = 0
  let denomValue = 0
  let denomQuantity = 0

  for (let i = 0; i < validItems.length; i++) {
    const valueDeviation = values[i] - meanValue
    const quantityDeviation = quantities[i] - meanQuantity

    numerator += valueDeviation * quantityDeviation
    denomValue += valueDeviation * valueDeviation
    denomQuantity += quantityDeviation * quantityDeviation
  }

  if (denomValue === 0 || denomQuantity === 0) return 0

  return numerator / Math.sqrt(denomValue * denomQuantity)
}

// Get data for treemap visualization
export function getTreemapData(
  items: ItemLog[],
): Array<{ name: string; children: Array<{ name: string; size: number; itemId: string }> }> {
  const rarityGroups: Record<string, Array<{ name: string; size: number; itemId: string }>> = {}

  // Filter out items with undefined properties
  const validItems = items.filter(
    (item) =>
      item &&
      item.id !== undefined &&
      item.name !== undefined &&
      item.price !== undefined &&
      item.quantity !== undefined &&
      item.rarity !== undefined,
  )

  for (const item of validItems) {
    const rarity = item.rarity || "Unknown"

    if (!rarityGroups[rarity]) {
      rarityGroups[rarity] = []
    }

    rarityGroups[rarity].push({
      name: item.name || `Item ${item.id}`,
      size: (item.quantity || 0) * (item.price || 0), // Size represents total value
      itemId: String(item.id), // Use String() instead of toString() to handle potential undefined
    })
  }

  return Object.entries(rarityGroups).map(([rarity, children]) => ({
    name: rarity || "Unknown",
    children: children || [],
  }))
}
