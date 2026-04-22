export type WSMessage =
  | { type: 'welcome'; user: { id: string; username: string } }
  | { type: 'echo'; received: unknown }
  | { type: 'error'; message: string }
  | { type: 'ping' }
  | { type: 'pong' }
  | { type: string; [key: string]: unknown };

export type WSHandlers = {
  onOpen?: () => void;
  onMessage?: (msg: WSMessage) => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (err: Event) => void;
};

export class RemoteSocket {
  private ws: WebSocket | null = null;
  private handlers: WSHandlers;
  private manuallyClosed = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(handlers: WSHandlers = {}) {
    this.handlers = handlers;
  }

  connect(): void {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      return;
    }

    const wsBaseUrl = import.meta.env.VITE_WS_URL || 
      (window.location.protocol === 'https:' ? `wss://${window.location.host}` : `ws://${window.location.host}`);
    
    const url = `${wsBaseUrl}/api/remote/ws`;

    this.manuallyClosed = false;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.addEventListener('open', () => {
      if (this.manuallyClosed) {
        ws.close();
        return;
      }
      this.startPing();
      this.handlers.onOpen?.();
    });

    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data) as WSMessage;
        if (msg.type === 'pong') return;
        this.handlers.onMessage?.(msg);
      } catch {}
    });

    ws.addEventListener('close', (ev) => {
      this.stopPing();
      if (this.manuallyClosed && !ev.wasClean) return;
      this.handlers.onClose?.(ev.code, ev.reason);
    });

    ws.addEventListener('error', () => {
      if (this.manuallyClosed) return;
      this.handlers.onError?.(new Event('error'));
    });
  }

  send(message: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  close(): void {
    this.manuallyClosed = true;
    this.stopPing();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    // Si CONNECTING, le listener 'open' fermera proprement la WS
    this.ws = null;
  }

  get wasManuallyClosed(): boolean {
    return this.manuallyClosed;
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30_000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}