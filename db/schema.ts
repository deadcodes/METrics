import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const items = sqliteTable("items", {
    id: int().primaryKey(),
    name: text().notNull(),
    price: int().notNull().default(0),
    alch: int().notNull().default(0),
    rarity: text().notNull().default('White'),
    stackable: int({mode:'boolean'}).notNull().default(false),
    tradable: int({mode: 'boolean'}).notNull().default(false),
    geLastUpdated: int().notNull().default(Date.now()),
});

export const ge = sqliteTable("ge", {
    id: int().primaryKey({ autoIncrement: true }),
    geLastUpdated: int().notNull().default(Date.now()),
    status: text().notNull().default('default')
})

export const settings = sqliteTable("settings", {
    id: int().primaryKey({ autoIncrement: true }),
    updated: int().notNull().default(Date.now()),
    path: text().notNull().default('')
})