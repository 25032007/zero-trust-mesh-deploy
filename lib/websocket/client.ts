/**
 * WebSocket Client for Dashboard
 * Connects to proxy server for real-time events
 */

type EventCallback = (data: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: Map<string, EventCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(url?: string) {
    this.url = url || this.getWebSocketUrl();
  }

  /**
   * Get WebSocket URL based on environment
   */
  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      return 'ws://localhost:4000';
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const proxyHost = process.env.NEXT_PUBLIC_PROXY_HOST || window.location.hostname;
    const proxyPort = process.env.NEXT_PUBLIC_PROXY_PORT || '4000';
    const host = `${proxyHost}:${proxyPort}`;

    return `${protocol}//${host}`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket Client] Connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[WebSocket Client] Parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket Client] Error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket Client] Disconnected');
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[WebSocket Client] Connection error:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: any): void {
    if (data.type === 'HISTORY') {
      this.emit('history', data.events);
      return;
    }

    this.emit('event', data);
    this.emit(data.type.toLowerCase(), data.data);
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket Client] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('[WebSocket Client] Max reconnect attempts reached');
      this.emit('reconnect_failed');
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send message to server
   */
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket Client] Not connected');
    }
  }

  /**
   * Send ping
   */
  ping(): void {
    this.send({ type: 'ping' });
  }

  /**
   * Register event listener
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }

    this.callbacks.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket Client] Event listener error (${event}):`, error);
        }
      });
    }
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
