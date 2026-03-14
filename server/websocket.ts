import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import type { Duplex } from "stream";

let wss: WebSocketServer | null = null;

// Map of videoId -> Set of connected clients
const videoSubscribers = new Map<number, Set<WebSocket>>();

const WS_PATH = "/api/ws";

export function initWebSocket(server: Server) {
  // Use noServer mode to manually handle upgrades
  // This prevents conflicts with Vite HMR WebSocket
  wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws, req) => {
    console.log("[WS] Client connected");

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "subscribe" && msg.videoId) {
          const videoId = Number(msg.videoId);
          if (!videoSubscribers.has(videoId)) {
            videoSubscribers.set(videoId, new Set());
          }
          videoSubscribers.get(videoId)!.add(ws);
          ws.send(JSON.stringify({ type: "subscribed", videoId }));
        }
      } catch {}
    });

    ws.on("close", () => {
      // Remove from all subscriptions
      videoSubscribers.forEach((clients) => clients.delete(ws));
    });

    ws.on("error", (err) => {
      console.error("[WS] Error:", err);
    });
  });

  // Only handle upgrade requests for our specific path
  server.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = request.url || "";
    // Only handle our WebSocket path - let Vite handle everything else
    if (url.startsWith(WS_PATH)) {
      wss!.handleUpgrade(request, socket as any, head, (ws) => {
        wss!.emit("connection", ws, request);
      });
    }
    // Do NOT handle other WebSocket connections - let them pass through to Vite
  });

  console.log(`[WS] WebSocket server initialized on path ${WS_PATH}`);
}

export function broadcastVideoProgress(
  videoId: number,
  data: { status: string; progress: number; finalVideoUrl?: string }
) {
  const clients = videoSubscribers.get(videoId);
  if (!clients || clients.size === 0) return;

  const message = JSON.stringify({
    type: "video_progress",
    videoId,
    ...data,
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  // Clean up if video is done
  if (data.status === "ready" || data.status === "error") {
    videoSubscribers.delete(videoId);
  }
}

export { WS_PATH };
