import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { query } from '../db/pool.js';

let wss: WebSocketServer;

interface WSMessage {
  type: string;
  data: any;
  timestamp: string;
}

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    ws.send(
      JSON.stringify({
        type: 'CONNECTED',
        data: { message: 'Connected to NetAdmin WebSocket' },
        timestamp: new Date().toISOString(),
      })
    );

    ws.on('close', () => {
      // Client disconnected
    });

    ws.on('error', (err) => {
      console.error(`[${new Date().toISOString()}] WebSocket error:`, err.message);
    });
  });

  // Start periodic broadcasts
  startOLTStatusBroadcast();
  startSignalQualityBroadcast();
}

function broadcast(message: WSMessage) {
  if (!wss) return;

  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Broadcast OLT status changes every 30 seconds
function startOLTStatusBroadcast() {
  setInterval(async () => {
    try {
      const result = await query(
        `SELECT id, name, status, signal_quality, last_check,
                uptime_seconds, ip_address, model
         FROM olts ORDER BY name`
      );

      broadcast({
        type: 'OLT_STATUS_UPDATE',
        data: result.rows,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] OLT broadcast error:`, error.message);
    }
  }, 30000);
}

// Broadcast signal quality updates every 60 seconds
function startSignalQualityBroadcast() {
  setInterval(async () => {
    try {
      const result = await query(
        `SELECT o.id, o.name,
                COALESCE(AVG(n.signal_rx), 0) as avg_signal,
                COALESCE(MIN(n.signal_rx), 0) as min_signal,
                COUNT(n.id) as onu_count
         FROM olts o
         LEFT JOIN onus n ON n.olt_id = o.id
         GROUP BY o.id, o.name`
      );

      broadcast({
        type: 'SIGNAL_QUALITY_UPDATE',
        data: result.rows,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Signal broadcast error:`, error.message);
    }
  }, 60000);
}

// Export broadcast function for use in route handlers (e.g., when creating incidents)
export function broadcastIncident(incident: any) {
  broadcast({
    type: 'INCIDENT_CREATED',
    data: incident,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastOLTStatusChange(oltId: string, newStatus: string) {
  broadcast({
    type: 'OLT_STATUS_CHANGED',
    data: { oltId, status: newStatus },
    timestamp: new Date().toISOString(),
  });
}
