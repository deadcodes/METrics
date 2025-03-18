import { NextResponse } from "next/server";
import eventEmitter from "@/lib/eventEmitter";

const activeControllers = new Set<ReadableStreamDefaultController<any>>();

export async function GET() {


    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Add the controller to track active streams
            activeControllers.add(controller);

            const sendData = (data: any) => {
                if (activeControllers.has(controller)) {
                    try {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    } catch (error) {
                        console.error("Failed to send SSE data:", error);
                        activeControllers.delete(controller);
                    }
                }
            };

            // Listen for events
            eventEmitter.on("newData", sendData);

            // Cleanup when the connection closes
            controller.enqueue(encoder.encode(`event: close\ndata: "Connection closed"\n\n`));
            return () => {
                activeControllers.delete(controller);
                eventEmitter.off("newData", sendData);
            };
        },
        cancel() {
            // Remove controller when the stream is closed
            activeControllers.delete(stream);
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
