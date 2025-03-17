import { HydratedLogEntry, ItemDBRow } from "./types";

export const uniqueDrops = (logs: HydratedLogEntry[]): Set<number> => {
    return new Set(logs?.map((entry) => entry.itemId))
}

export const convertToAbbreviation = (input: number): string => {
    // Create a new Intl.NumberFormat object with options
    const formatter = new Intl.NumberFormat('en', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumSignificantDigits: 3
    });

    // Format the number and return the result
    return formatter.format(input);
}

export const calculateItemsValue = (logs: HydratedLogEntry[]): number => {
    return logs.reduce((sum, entry) => sum + (entry.quantity * entry.item.price), 0)
}

export const calculateTimeSeriesData = (logs: HydratedLogEntry[]) => {
    const timeSeriesMap = new Map<number, number>()
    for (const entry of logs) {
        const existing = timeSeriesMap.get(entry.timestamp) || 0
        timeSeriesMap.set(entry.timestamp, existing + (entry.quantity * entry.item.price))
    }

    const timeSeriesData = Array.from(timeSeriesMap.entries())
        .map(([timestamp, value]) => ({
            timestamp,
            formattedTime: new Date(timestamp * 1000),
            value,
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
    return timeSeriesData
}

export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const formatDateYYYYmmDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const formatRare = (value: ItemDBRow) => {
    return value.name.toUpperCase()
}

// // Create data for heatmap of activity by hour and day
// export function getActivityHeatmapData(entries: HydratedLogEntry[]) {
//     // a is a hack to simplify math
//     const dayNames = ["a", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
//     const dayMap = new Map<string, number>()
//     dayNames.map(d => dayMap.set(d, 0))

//     const heatmapData: Array<{ day: string; hour: string; value: number }> = []
//     // Initialize the heatmap data structure
//     for (let day = 1; day < 8; day++) {
//         for (let hour = 0; hour < 24; hour++) {

//             heatmapData.push({
//                 day: dayNames[day],
//                 hour: `${hour.toString().padStart(2, "0")}:00`,
//                 value: 0,
//             })
//         }
//     }

//     // Count entries by day and hour
//     for (const entry of entries) {
//         const date = new Date(entry.timestamp * 1000)
//         const day = date.getDay()
//         const hour = date.getHours()

//         const index = day * 24 + hour
//         if (index < heatmapData.length) {
//             const currentDay = dayNames[day]
//             dayMap.set(currentDay, dayMap.get(currentDay)! + 1)
//             heatmapData[index].value += 1
//         }
//     }
//     return heatmapData
// }


/**
 * Transforms data for activity heatmap
 */
export function transformActivityHeatmapData(entries: HydratedLogEntry[]) {
    if (!entries.length) {
        return { series: [], categories: { days: [], hours: [] } }
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}`)

    // Initialize data structure
    const heatmapData = Array(7)
        .fill(0)
        .map(() => Array(24).fill(0))

    // Count entries by day and hour
    for (const entry of entries) {
        const date = new Date(entry.timestamp * 1000)
        const day = date.getDay()
        const hour = date.getHours()

        heatmapData[day][hour] += 1
    }

    // Format for ApexCharts
    const series = dayNames.map((name, dayIndex) => {
        return {
            name,
            data: heatmapData[dayIndex],
        }
    })

    return {
        series,
        categories: {
            days: dayNames,
            hours: hourLabels,
        },
    }
}


/**
 * Transforms data for activity heatmap
 */
export function getActivityHeatmapData(entries: HydratedLogEntry[]) {
    // a is a hack to simplify math
    const dayNames = ["a", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayMap = new Map<string, number>()
    dayNames.map(d => dayMap.set(d, 0))

    const heatmapData: Array<{ day: string; hour: string; value: number }> = []
    // Initialize the heatmap data structure
    for (let day = 1; day < 8; day++) {
        for (let hour = 0; hour < 24; hour++) {

            heatmapData.push({
                day: dayNames[day],
                hour: `${hour.toString().padStart(2, "0")}:00`,
                value: 0,
            })
        }
    }

    // Count entries by day and hour
    for (const entry of entries) {
        const date = new Date(entry.timestamp * 1000)
        const day = date.getDay()
        const hour = date.getHours()

        const index = day * 24 + hour
        if (index < heatmapData.length) {
            const currentDay = dayNames[day]
            dayMap.set(currentDay, dayMap.get(currentDay)! + 1)
            heatmapData[index].value += 1
        }
    }
    return heatmapData
}

export function getActivityHeatmapDataByDay(entries: HydratedLogEntry[]) {
    // a is a hack to simplify math
    const dayNames = ["a", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayMap = new Map<string, number[]>()
    dayNames.map(d => dayMap.set(d, new Array(24).fill(0)))
    const heatmapData = getActivityHeatmapData(entries)

    dayNames.map((day, idx) => {
        let dayRecord = dayMap.get(day)!
        for (let i = 0; i < 24; i++) {
            dayRecord[i] = heatmapData[idx * i].value
        }
        dayMap.set(day, dayRecord)
    })
    // a is a hack to simplify math
    dayMap.delete("a")
    const dayArray = Array.from(dayMap)
    return Object.entries(dayArray).map(([day, values]) => ({ name: values[0], data: values[1] }));
}

/**
 * Calculate value per hour
 */
export function calculateValuePerHour(entries: HydratedLogEntry[]): number {

    let hourlySums = {};
    let hourlyCounts = {};

    entries.forEach(({ timestamp, item, quantity }) => {
        let hour = Math.floor(timestamp / 3600) * 3600; // Normalize to the start of the hour

        if (!hourlySums[hour]) {
            hourlySums[hour] = 0;
            hourlyCounts[hour] = 0;
        }

        hourlySums[hour] += item.price * quantity;
        hourlyCounts[hour]++;
    });

    let totalSum = 0;
    let totalHours = Object.keys(hourlySums).length;

    Object.values(hourlySums).forEach(sum => {
        totalSum += sum;
    });
    return totalHours > 0 ? Math.floor(totalSum / totalHours) : 0
}

export function calculateTotalHours(entries: HydratedLogEntry[]) {
    if (entries.length === 0) return "0 hours 0 minutes";

    // Sort data by timestamp
    entries.sort((a, b) => a.timestamp - b.timestamp);

    let totalRuntime = 0;
    let lastTimestamp = entries[0].timestamp;
    let sessionStart = lastTimestamp;
    const maxGap = 15 * 60; // 15 minutes in seconds

    for (let i = 1; i < entries.length; i++) {
        const currentTimestamp = entries[i].timestamp;
        if (currentTimestamp - lastTimestamp > maxGap) {
            // Gap exceeded, finalize previous session
            totalRuntime += lastTimestamp - sessionStart;
            sessionStart = currentTimestamp; // Start new session
        }
        lastTimestamp = currentTimestamp;
    }

    // Add the last session
    totalRuntime += lastTimestamp - sessionStart;

    // Convert runtime to minutes and hours with 2 decimal places
    const totalMinutes = Math.floor(totalRuntime / 60) % 60;
    const totalHours = Math.floor(totalRuntime / 3600);

    return `${totalHours} hours ${totalMinutes} minutes`;
    // return { minutes: totalMinutes, hours: totalHours };
}


/**
 * Transforms data for stacked area chart
 */
export function transformStackedAreaData(entries: HydratedLogEntry[]) {
    if (!entries.length) {
        const dummy = new Map<number, string>()
        return { series: [], categories: [], annotations: dummy }
    }

    // Define 5-minute interval in seconds
    const INTERVAL = 5 * 60 // 5 minutes in seconds

    // Group entries by 5-minute intervals and rarity
    const timeRarityMap = new Map<number, Record<string, number>>()
    const uniqueRarities = new Set<string>()
    // const annotations = new Map<number, string>()
    const annotations = []
    // Process each entry
    for (const entry of entries) {
        const rarity = entry.item.rarity || "Unknown"
        uniqueRarities.add(rarity)
        // Round timestamp down to nearest 5-minute interval
        const intervalTimestamp = Math.floor(entry.timestamp / INTERVAL) * INTERVAL

        if (!timeRarityMap.has(intervalTimestamp)) {
            timeRarityMap.set(intervalTimestamp, {})
        }
        const timeData = timeRarityMap.get(intervalTimestamp)!
        timeData[rarity] = (timeData[rarity] || 0) + (entry.quantity * entry.item.price)
        if (rarity === 'Orange' || rarity === 'Purple' || rarity === 'Blue') {
            annotations.push(
                {
                    x: intervalTimestamp * 1000,
                    strokeDashArray: 0,
                    borderColor: getRarityColor(rarity),
                    label: {
                        borderColor: getRarityColor(rarity),
                        style: {
                            color: "#fff",
                            background: getRarityColor(rarity)
                        },
                        text: entry.item.name
                    }
                }
            )
        }
    }

    // Convert to array format for chart
    const timePoints = Array.from(timeRarityMap.entries()).sort((a, b) => a[0] - b[0])
    // Extract timestamps and formatted times
    const categories = timePoints.map(([timestamp]) => {
        return new Date(timestamp * 1000).toUTCString()
    })

    // Create series data for each rarity
    const rarities = Array.from(uniqueRarities)
    const series = rarities.map((rarity) => {
        const data = timePoints.map(([_, values]) => values[rarity] || 0)
        return {
            name: rarity,
            data,
        }
    })

    return { series, categories, annotations }
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