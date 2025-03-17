import type { NextApiRequest } from "next"
import type { NextApiResponseServerIO } from "@/lib/types"
import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { initWebSocket } from "@/lib/file-actions"

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket",
    })
    res.socket.server.io = io

    initWebSocket(httpServer)
  }
  res.end()
}

export default SocketHandler

