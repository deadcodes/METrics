import { getItemFromDatabase } from "@/db/dao"
import type { HydratedLogEntry, LogEntry } from "./types"

// Parse a log file content into log entries
export function parseLogFile(content: string): LogEntry[] {
  // console.log('file content',content)
  const entries: LogEntry[] = []

  // Split the content by lines
  const lines = content.trim().split("\n")

  for (const line of lines) {
    // Parse each line based on the specified format
    // Format: timestamp,itemId,quantity
    const parts = line.split(",")

    if (parts.length === 3) {
      try {
        const timestamp = Number.parseInt(parts[0], 10)
        const itemId = Number.parseInt(parts[1], 10)
        const quantity = Number.parseInt(parts[2], 10)

        if (!isNaN(timestamp) && !isNaN(itemId) && !isNaN(quantity)) {
          entries.push({ timestamp, itemId, quantity })
        }
      } catch (error) {
        console.error("Error parsing log line:", line, error)
      }
    }
  }

  return entries
}

export async function hydrateItemInfoInLogs(loglines: LogEntry[]): Promise<HydratedLogEntry[]> {
  const hydratedLogs: HydratedLogEntry[] = [];
  try {
    loglines.map(async (d: LogEntry) => {
      const dbrow = await getItemFromDatabase(d.itemId)
      const item:HydratedLogEntry = {
        itemId:d.itemId,
        quantity:d.quantity,
        timestamp:d.timestamp,
        item:dbrow
      }
      hydratedLogs.push(item)
    })
  } catch(e) {}
  return hydratedLogs;
}
