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
  name:string
  tradable: boolean
  isOnGE:boolean
  value:number
  alch:number
  stackable:boolean
}