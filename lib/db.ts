import Dexie, { type Table } from "dexie"

export interface Settings {
  id?: number
  selectedDirectory: string
  selectedUser: string
}

export class AppDatabase extends Dexie {
  settings!: Table<Settings>

  constructor() {
    super("LogMetricsDB")
    this.version(1).stores({
      settings: "++id, selectedDirectory, selectedUser",
    })
  }
}

export const db = new AppDatabase()

