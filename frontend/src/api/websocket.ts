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
    // Garde-fou : pas de double connexion
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/remote/ws`;

    this.manuallyClosed = false;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.addEventListener('open', () => {
      // Si on a demandé close() pendant le CONNECTING, fermer maintenant sans déclencher onOpen
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
      } catch {
        // ignore
      }
    });

    ws.addEventListener('close', (ev) => {
      this.stopPing();
      // Si on a manually closed pendant CONNECTING, on ne propage pas
      // (l'appelant ne s'attend pas à un onClose sans onOpen préalable)
      if (this.manuallyClosed && !ev.wasClean) return;
      this.handlers.onClose?.(ev.code, ev.reason);
    });

    ws.addEventListener('error', () => {
      // Les erreurs avant open sont souvent dues au StrictMode et ne sont pas actionnables
      // On les log en debug mais on ne propage pas si on était en train de se fermer
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