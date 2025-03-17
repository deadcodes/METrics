"use server"
import fs from "fs"
import { hydrateItemInfoInLogs, parseLogFile } from "./log-parser";
import { HydratedLogEntry } from "./types";

export async function scanDirectory(path: string): Promise<string[]> {
    try {
        if (path?.length < 1) return []
        console.log('content', path);
        const dir = fs.readdirSync(path)
        console.log('dir is', dir)
        const logfiles = dir.filter(d => d.endsWith('.log'))
        console.log('logfiles', logfiles)
        const users = logfiles.map(d => d.split('.')[0])
        console.log('users', users)
        return users || []
    } catch (error) {
        console.error("Error scanning directory:", error)
        return []
    }
}

export async function getAllUsersHydratedLogData(path:string): Promise<HydratedLogEntry[]> {
    const users = await scanDirectory(path)
    let data = ""
    users.map(d => {
        try {
            const filePath = `${path}\\${d}.log`
            console.log('filePath', filePath)
            const res = fs.readFileSync(filePath);
            data += res.toString();
        } catch (e) {
            data = "";
        }
    })
    const logEntries = parseLogFile(data);
    const logData = await hydrateItemInfoInLogs(logEntries)
    return logData
}

export async function getHydratedUserLogData(path: string, username: string): Promise<HydratedLogEntry[]> {
    const filepath = `${path}\\${username}.log`
    console.log('path is', path, username, filepath);
    let data;
    try {
        const res = fs.readFileSync(filepath);
        data = res.toString();
    } catch (e) {
        // console.log('read failed', e)
        data = "";
    }

    const logEntries = parseLogFile(data);
    // Parse and process the log entries
    const logData = await hydrateItemInfoInLogs(logEntries)
    // console.log('logData', logData)
    return logData;
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