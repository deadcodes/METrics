"use server"
import fs from "fs";
import path from "path";
import { sendDataToClients } from "./sendData";
import { throttle } from "lodash";

export async function watchDropsFolder(dropsFolder: string) {
    console.log('watching', dropsFolder)
    if (!fs.existsSync(dropsFolder)) {
        console.error("Drops folder does not exist!");
        return;
    }

    // throttled function to prevent multiple calls in rapid succession
    const throttledSend = throttle((filename: string) => {
        // console.log(`File updated: ${filename}, sending update...`);
        sendDataToClients({ timestamp: Date.now() });
    }, 1000, { leading: false, trailing: true }); // Adjust debounce delay as needed

    fs.watch(dropsFolder, (eventType, filename) => {
        if (filename) {
            const filePath = path.join(dropsFolder, filename);

            if (eventType === "change") {
                fs.readFile(filePath, "utf-8", (err, data) => {
                    if (!err) {
                        // console.log(`File changed: ${filename}, sending update...`);
                        throttledSend(filename);
                    } else {
                        console.error(`Error reading file ${filename}:`, err);
                    }
                });
            }
        }
    });

    console.log("Watching for changes in the Drops folder...");
}
