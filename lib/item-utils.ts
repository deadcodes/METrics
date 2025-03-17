import type { Item, ItemDBRow, ItemDetail, ItemLog } from "./types"
// Cache for item details to avoid repeated fetches
const itemDetailsCache: Record<string, ItemDetail> = {}

export function getGELastUpdatedAsync() {
  const url = `https://api.weirdgloop.org/exchange`
  try {
    fetch(url).then(d => {
      if (d.ok) {
        d.json().then(rJson => {
          const date = new Date(rJson['rs'])
          // console.log(date)
          return date
        })
      } else { console.log('getGELastUpdated fetch failed', d.statusText);return null }
    })
  } catch (e) { console.log('getGELastUpdated died', e) }
  return null
}

async function getGELastUpdated() {
  const url = `https://api.weirdgloop.org/exchange`
  try {
      const data = await fetch(url)
      if (data.ok) {
          const rJson = await data.json()
          const date = new Date(rJson['rs'])
          // console.log(date)
          return date
      } else { console.log('getGELastUpdated fetch failed', data.statusText);return null }
  } catch (e) { console.log('getGELastUpdated died', e) }
  return null
}

export async function getGEPrice(itemId: number) {
  const url = `https://api.weirdgloop.org/exchange/history/rs/latest?id=${itemId}`
  try {
    const data = await fetch(url)
    if (data.ok) {
      const rJson = await data.json();
      console.log(rJson[itemId].price, new Date(rJson[itemId].timestamp));
    } else { console.log('getGEPrice fetch failed', data.statusText) }
  } catch (e) { console.log(`getGEPrice fail for ${itemId}`) }
}

export async function getAllGEPrices() {
  const url = `https://runescape.wiki/?title=Module:GEPrices/data.json&action=raw&ctype=application%2Fjson`
  try {
    const data = await fetch(url)
    if (data.ok) {
      const rJson = await data.json();
      return rJson
    } else { console.log('getGEPrice fetch failed', data.statusText); return null }
  }catch (e) { console.log(`getAllGEPrices fail for `,e); return null }
}

export function getRarityColor(rarity: string): string {
  switch ((rarity || "Unknown").toLowerCase()) {
    case "white":
      return "#9ca3af" // gray-400
    case "green":
      return "#10b981" // emerald-500
    case "blue":
      return "#3b82f6" // blue-500
    case "purple":
      return "#8b5cf6" // violet-500
    case "orange":
      return "#f59e0b" // amber-500
    default:
      return "#9ca3af" // gray-400
  }
}

export function getRarityColorByPrice(price: number) {
  if (price < 1000) {
    return "White";
  } else if (price >= 1000 && price < 10_000_000) {
    return "Green";
  } else if (price >= 10_000_000 && price < 100_000_000) {
    return "Blue";
  } else if (price >= 100_000_000 && price < 500_000_000) {
    return "Purple";
  } else {
    return "Orange";
  }
}


// Calculate value per hour based on a 15-minute rolling window
export function calculateValuePerHour(
  entries: Array<{ timestamp: number; itemId: number; quantity: number }>,
  itemDetails: Record<string, ItemDetail>,
): number {
  const now = Math.floor(Date.now() / 1000)
  const fifteenMinutesAgo = now - 15 * 60

  // Filter entries within the last 15 minutes
  const recentEntries = entries.filter((entry) => entry.timestamp >= fifteenMinutesAgo)

  // Calculate total value
  let totalValue = 0

  for (const entry of recentEntries) {
    const itemId = entry.itemId.toString()
    const detail = itemDetails[itemId]

    if (detail) {
      totalValue += detail.price * entry.quantity
    }
  }

  // Multiply by 4 to get hourly rate (15 minutes = 1/4 hour)
  return totalValue * 4
}

// Group items by rarity
export function groupItemsByRarity(
  itemLogs: ItemLog[],
): Record<string, { count: number; items: Array<{ id: number; name: string; quantity: number }> }> {
  const rarityGroups: Record<string, { count: number; items: Array<{ id: number; name: string; quantity: number }> }> =
    {}

  for (const item of itemLogs) {
    const rarity = item.rarity

    if (!rarityGroups[rarity]) {
      rarityGroups[rarity] = { count: 0, items: [] }
    }

    rarityGroups[rarity].count += item.quantity
    rarityGroups[rarity].items.push({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
    })
  }

  return rarityGroups
}
