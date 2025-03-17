export interface LogEntry {
  timestamp: number
  itemId: number
  quantity: number
}

export interface HydratedLogEntry {
  timestamp: number
  itemId: number
  quantity: number
  item: ItemDBRow
}
export interface ItemDBRow {
  id: number
  name: string
  price: number
  alch: number
  rarity: string
  tradable: boolean
  stackable: boolean
  geLastUpdated: number
}
export interface Item {
  id:number
  name: string
  tradable: boolean
  isOnGE: boolean
  value:number
  alch:number
  stackable:boolean
}

export interface ItemDetail {
  id: number
  name: string
  price: number
  alch: number
  rarity: string
  timestamp: number
}

export interface ItemLog extends ItemDetail {
  quantity: number
  dataTimestamp: number
}

export interface LogData {
  overview: {
    totalEntries: number
    uniqueItems: number
    totalQuantity: number
    lastUpdated: string
  }
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
  // Add raw entries for value-per-hour calculation
  rawEntries: LogEntry[]
  // Add itemLogs array
  itemLogs: ItemLog[]
}

export interface Settings {
  id?: number
  selectedDirectory: string
  selectedUser: string
}

export interface ItemValue {
  range: number[]
  value: number,
  records: number
  average: number,
  rare: { x: number, y: number, z: number, name: string } | undefined
  items: string[]
}