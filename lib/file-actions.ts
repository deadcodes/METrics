"use server"

import fs from "fs"
import type { LogData, LogEntry, ItemLog } from "./types"
import { getItemDetails } from "./item-utils"

// Scan directory to find available user log files
export async function scanDirectory(path: string): Promise<string[]> {
  try {
    try {
            if (path.length < 1) return []
            console.log('content', path);
            const dir = fs.readdirSync(path)
            console.log('dir is', dir)
            const logfiles = dir.filter(d=> d.endsWith('.log'))
            console.log('logfiles', logfiles)
            const users = dir.map(d => d.split('.')[0])
            console.log('users', users)
            return users || []
        } catch (error) {
            console.error("Error scanning directory:", error)
            const mockUsers = ["alice", "bob", "charlie", "dave", "eve"]
            return mockUsers.filter(() => Math.random() > 0.3) // Randomly exclude some users
        }

    // In a real implementation, we would use the fs module to read the directory
    // For this demo, we'll simulate finding log files
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing delay

    // Simulate finding log files (alice.log, bob.log, etc.)
    const mockUsers = ["alice", "bob", "charlie", "dave", "eve"]
    return mockUsers.filter(() => Math.random() > 0.3) // Randomly exclude some users
  } catch (error) {
    console.error("Error scanning directory:", error)
    return []
  }
}

// Get log data for a specific user or all users
export async function getUserLogData(path: string, username: string): Promise<LogData> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate log entries based on the username
  let logEntries: LogEntry[] = []

  if (username === "all") {
    // For "all users", combine logs from all users
    const mockUsers = ["alice", "bob", "charlie", "dave", "eve"]
    for (const user of mockUsers) {
      logEntries = [...logEntries, ...generateMockLogEntries(user)]
    }
  } else {
    // For a specific user
    logEntries = generateMockLogEntries(username)
  }

  // Parse and process the log entries
  return processLogEntries(logEntries)
}

// Clear log file for a specific user
export async function clearUserLogFile(path: string, username: string): Promise<boolean> {
  try {
    // In a real implementation, we would use the fs module to clear or reset the log file
    // For this demo, we'll simulate clearing the log file
    console.log(`Clearing log file for user ${username} in directory ${path}`)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return success
    return true
  } catch (error) {
    console.error(`Error clearing log file for user ${username}:`, error)
    return false
  }
}

// Generate mock log entries for a user
function generateMockLogEntries(username: string): LogEntry[] {
  const entries: LogEntry[] = []
  const now = Math.floor(Date.now() / 1000)
  const itemIds = [1391, 21634, 57523, 995, 8842, 3301]

  // Generate entries for the last hour with 5-minute intervals
  for (let i = 0; i < 12; i++) {
    const timestamp = now - 60 * 5 * (11 - i)

    // Generate 2-4 entries per timestamp
    const entryCount = Math.floor(Math.random() * 3) + 2

    for (let j = 0; j < entryCount; j++) {
      // Select a random item ID
      const itemIdIndex = Math.floor(Math.random() * itemIds.length)
      const itemId = itemIds[itemIdIndex]

      // Generate a quantity based on the username (for consistent but different data)
      let quantityBase = 0
      switch (username) {
        case "alice":
          quantityBase = 10
          break
        case "bob":
          quantityBase = 25
          break
        case "charlie":
          quantityBase = 5
          break
        case "dave":
          quantityBase = 50
          break
        case "eve":
          quantityBase = 15
          break
        default:
          quantityBase = 20
      }

      const quantity = Math.floor(Math.random() * quantityBase) + 1

      entries.push({
        timestamp,
        itemId,
        quantity,
      })
    }
  }

  return entries
}

// Process log entries into the required data format
async function processLogEntries(entries: LogEntry[]): Promise<LogData> {
  // Sort entries by timestamp
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp)

  // Calculate overview metrics
  const uniqueItems = new Set(entries.map((entry) => entry.itemId)).size
  const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0)
  const lastUpdated = new Date(entries[entries.length - 1]?.timestamp * 1000).toISOString()

  // Generate time series data
  const timeSeriesMap = new Map<number, number>()
  for (const entry of entries) {
    const existing = timeSeriesMap.get(entry.timestamp) || 0
    timeSeriesMap.set(entry.timestamp, existing + entry.quantity)
  }

  const timeSeriesData = Array.from(timeSeriesMap.entries())
    .map(([timestamp, totalQuantity]) => ({
      timestamp,
      formattedTime: new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      totalQuantity,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  // Generate item quantities data
  const itemQuantitiesMap = new Map<number, number>()
  for (const entry of entries) {
    const existing = itemQuantitiesMap.get(entry.itemId) || 0
    itemQuantitiesMap.set(entry.itemId, existing + entry.quantity)
  }

  const itemQuantities = Array.from(itemQuantitiesMap.entries())
    .map(([itemId, quantity]) => ({
      itemId: itemId.toString(),
      quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity) // Sort by quantity descending

  // Generate item distribution data
  const itemDistribution = itemQuantities.map((item) => ({
    itemId: item.itemId,
    quantity: item.quantity,
    percentage: (item.quantity / totalQuantity) * 100,
  }))

  // Generate ItemLog array
  const itemLogs: ItemLog[] = []
  for (const [itemId, quantity] of itemQuantitiesMap.entries()) {
    try {
      const itemDetail = await getItemDetails(itemId.toString())
      if (itemDetail) {
        // Find the most recent timestamp for this item
        const itemEntries = entries.filter((entry) => entry.itemId === itemId)
        const latestEntry = itemEntries.reduce(
          (latest, current) => (current.timestamp > latest.timestamp ? current : latest),
          itemEntries[0],
        )

        // Ensure all required fields have default values if missing
        itemLogs.push({
          id: itemId,
          name: itemDetail.name || `Item ${itemId}`,
          price: itemDetail.price || 0, // Map value to price with default
          alch: Math.round((itemDetail.price || 0) * 0.6), // Simulate alch value with default
          rarity: itemDetail.rarity || "Unknown",
          timestamp: itemDetail.timestamp || Date.now() / 1000,
          quantity: quantity || 0,
          dataTimestamp: latestEntry?.timestamp || Date.now() / 1000,
        })
      }
    } catch (error) {
      console.error(`Error getting details for item ${itemId}:`, error)
    }
  }

  return {
    overview: {
      totalEntries: entries.length,
      uniqueItems,
      totalQuantity,
      lastUpdated,
    },
    timeSeriesData,
    itemQuantities,
    itemDistribution,
    rawEntries: entries,
    itemLogs,
  }
}

