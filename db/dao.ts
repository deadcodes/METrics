"use server"
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { eq, sql } from 'drizzle-orm';
import { ge, items, settings } from './schema';
import { Item, ItemDBRow } from '@/lib/types';
import * as lodash from 'lodash';
import { getAllGEPrices, getRarityColorByPrice } from '@/lib/item-utils';
const itemsJson: Item[] = require('../items.json')

const db = drizzle(process.env.DB_FILE_NAME!);

export const initDB = async () => {
    console.log('init db')
    updateGEData();
}

export async function getGELastUpdated() {
    const url = `https://api.weirdgloop.org/exchange`
    try {
        const data = await fetch(url)
        if (data.ok) {
            const rJson = await data.json()
            const date = new Date(rJson['rs'])
            // console.log(date)
            return date
        } else { console.log('getGELastUpdated fetch failed', data.statusText) }
    } catch (e) { console.log('getGELastUpdated died', e) }
    return null
}

export const getItemFromDatabase = async (itemId: number): Promise<ItemDBRow> => {
    // console.log('getting getItemFromDatabase', itemId)
    try {
        const data = await db.select().from(items).where(eq(items.id, itemId)).limit(1)
        if (data.length > 0) {
            return data[0]
        }
    } catch (e) {
        console.log('db query getItem died', e)
    }
    return {
        id: 0,
        name: 'Unknown',
        price: 0,
        alch: 0,
        rarity: 'White',
        stackable: false,
        tradable: false,
        geLastUpdated: Date.now()
    }
}

export const getGEDBTimestamp = async (): Promise<{ id: number, geLastUpdated: Date, status: string }> => {
    try {
        const rows = await db.select().from(ge).limit(1)
        if (rows.length) {
            const data = rows[0]
            const result = { geLastUpdated: new Date(data.geLastUpdated), id: data.id, status: data.status }
            // console.log('getGETimestamp', result)
            return result
        } else {
            return { id: 0, geLastUpdated: new Date(0), status: 'default' }
        }
    } catch (e) { }
    return { id: 0, geLastUpdated: new Date(0), status: 'error' }
}

export const setItemToDatabase = async (item: ItemDBRow): Promise<void> => {
    console.log('setting setItemToDatabase', item)
    try {
        await db.insert(items).values(item).onConflictDoUpdate({ target: items.id, set: { ...item, id: sql`${items.id}` } })
    } catch (e) {
        console.log('db query setItem died', e)
    }
}

export const bulkUpsert = async (rows: ItemDBRow[]): Promise<boolean> => {
    const chunkSize = 100
    try {
        let chunks = lodash.chunk(rows, chunkSize)
        console.log('chunks', chunks.length, rows.length, Date.now())
        chunks.map(async d => {
            // console.log('chunk', d.length)
            await db.insert(items).values(d).onConflictDoUpdate({ target: items.id, set: { ...d, id: sql`${items.id}` } });
        })
        return true
    } catch (e) {
        console.log('db query setItem died', e)
        return false
    }
}

export const getAllItemsFromDatabase = async (): Promise<ItemDBRow[]> => {
    try {
        const data = await db.select().from(items)
    } catch (e) {
        console.log('db query getItem died', e)
    }
    return []
}


export const shouldUpdateGEData = async (): Promise<boolean> => {
    const timestamp = await getGELastUpdated()
    console.log('GE Last Updated', timestamp)
    if (timestamp) {
        try {
            const gedb = await getGEDBTimestamp()
            if (gedb.status === 'default') { return true }
            if (gedb.geLastUpdated > new Date(0)) {
                // console.log('shouldUpdateGEData', geTimestamp)
                if (gedb.status === 'inProgress') { return false }
                if (timestamp > new Date(gedb.geLastUpdated)) {
                    console.log('should update')
                    return true
                } else { console.log('shouldnt'); return false }
            }
        } catch (e) { console.log('shouldUpdateGEData died', e); return false }
    }
    return false
}

export const updateGEData = async (): Promise<void> => {
    console.log('updateGEData', Date.now())
    shouldUpdateGEData().then(should => {
        if (should) {
            getAllGEPrices().then(geData => {
                const rows = itemsJson.map(d => {
                    if (geData[d.name]) {
                        let item: ItemDBRow = {
                            price: geData[d.name],
                            rarity: getRarityColorByPrice(geData[d.name]),
                            geLastUpdated: Date.now(),
                            ...d
                        }
                        return item
                    } else { return undefined }
                })
                bulkUpsert(rows.filter(d => d !== undefined)).then(async status => {
                    console.log('bulk upsert', status)
                    if (status) {
                        const data = { id: 0, status: 'completed', geLastUpdated: Date.now() }
                        const status = await db.insert(ge).values(data).onConflictDoUpdate({ target: ge.id, set: { ...data, id: sql`${ge.id}` } });
                        console.log('upsert result', status)
                    }
                })
            })
        }
    })
}

export const getPathFromDB = async():Promise<string | undefined> => {
    console.log('getPathFromDB', Date.now()) 
    try {
        const settingsData = await db.select().from(settings).limit(1)
        if(settingsData.length) {
            return settingsData[0].path
        }
    } catch (e) {console.log('getPathFromDB died', e); return undefined}
    return undefined
}

export const setPathInDB = async(path:string): Promise<void> => {
    console.log('setPathInDB',path) 
    try {
        const data = { id: 0, path: path, updated: Date.now() }
        const status = await db.insert(settings).values(data).onConflictDoUpdate({ target: settings.id, set: { ...data, id: sql`${settings.id}` } });
        console.log('setPathInDB result', status)
    } catch (e) {console.log('setPathInDB died', e); return undefined}
}