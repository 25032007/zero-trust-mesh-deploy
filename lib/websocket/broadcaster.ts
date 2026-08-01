/**
 * WebSocket Event Broadcaster
 * Sends real-time security events to connected dashboards
 */

import { WebSocketServer, WebSocket } from 'ws';

interface BroadcastEvent {
  type: string;
  data: any;
  timestamp?: Date;
}

class WSEventBroadcaster {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private eventHistory: BroadcastEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Initialize WebSocket server
   */
  initialize(wss: WebSocketServer): void {
    this.wss = wss;

    wss.on('connection', (ws: WebSocket) => {
      console.log('[WebSocket] Client connected. Total clients:', this.clients.size + 1);

      this.clients.add(ws);

      // Send recent event history to new client
      this.sendHistory(ws);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);

          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
          }
        } catch (error) {
          console.error('[WebSocket] Message parse error:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('[WebSocket] Client disconnected. Total clients:', this.clients.size);
      });
    });

    console.log('[WebSocket] Broadcaster initialized');
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: BroadcastEvent): void {
    const message = {
      ...event,
      timestamp: new Date(),
    };

    // Store in history
    this.eventHistory.push(message);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Send to all connected clients
    const messageStr = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr, (error) => {
          if (error) {
            console.error('[WebSocket] Send error:', error);
          }
        });
      }
    });
  }

  /**
   * Send event history to a client
   */
  private sendHistory(ws: WebSocket): void {
    const historyMessage = {
      type: 'HISTORY',
      events: this.eventHistory.slice(-100), // Send last 100 events
      timestamp: new Date(),
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(historyMessage));
    }
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get event history
   */
  getEventHistory(limit: number = 100): BroadcastEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Broadcast threat alert
   */
  broadcastThreat(threatData: any): void {
    this.broadcast({
      type: 'THREAT_ALERT',
      data: threatData,
    });
  }

  /**
   * Broadcast request event
   */
  broadcastRequest(requestData: any): void {
    this.broadcast({
      type: 'REQUEST',
      data: requestData,
    });
  }

  /**
   * Broadcast policy violation
   */
  broadcastPolicyViolation(violationData: any): void {
    this.broadcast({
      type: 'POLICY_VIOLATION',
      data: violationData,
    });
  }

  /**
   * Broadcast quarantine event
   */
  broadcastQuarantine(quarantineData: any): void {
    this.broadcast({
      type: 'QUARANTINE',
      data: quarantineData,
    });
  }

  /**
   * Broadcast metrics update
   */
  broadcastMetrics(metricsData: any): void {
    this.broadcast({
      type: 'METRICS_UPDATE',
      data: metricsData,
    });
  }
}

export const wsEventBroadcaster = new WSEventBroadcaster();
