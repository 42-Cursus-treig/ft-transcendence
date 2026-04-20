import { useEffect, useRef, useState } from 'react';
import { RemoteSocket, type WSMessage } from '../api/websocket';

export function WsTest() {
  const [log, setLog] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<RemoteSocket | null>(null);

  const addLog = (entry: string) =>
    setLog((l) => [...l.slice(-19), `${new Date().toLocaleTimeString()} ${entry}`]);

  useEffect(() => {
    let hasOpened = false;

    const socket = new RemoteSocket({
        onOpen: () => {
        hasOpened = true;
        addLog('[open] WebSocket connected');
        setConnected(true);
        },
        onMessage: (msg: WSMessage) => {
        addLog(`[msg] ${JSON.stringify(msg)}`);
        },
        onClose: (code, reason) => {
        if (!hasOpened) return;
        addLog(`[close] code=${code} reason=${reason || '(none)'}`);
        setConnected(false);
        },
        onError: () => {
        if (!hasOpened) return;
        addLog('[error] WebSocket error');
        },
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
        socket.close();
    };
    }, []);

  const sendPing = () => {
    socketRef.current?.send({ type: 'ping', time: Date.now() });
    addLog('[sent] ping');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl neon text-accent mb-2">
        &gt; WS DEBUG
      </h1>
      <p className="font-body text-base text-muted mb-6">
        Status: {connected ? (
          <span className="text-accent">CONNECTED</span>
        ) : (
          <span className="text-danger">DISCONNECTED</span>
        )}
        <span className="cursor-blink"></span>
      </p>

      <button
        onClick={sendPing}
        disabled={!connected}
        className="btn-arcade-primary mb-6"
      >
        &gt; SEND PING
      </button>

      <div className="arcade-panel font-body text-sm space-y-1 max-h-96 overflow-y-auto">
        {log.map((line, i) => (
          <div key={i} className="text-text">{line}</div>
        ))}
        {log.length === 0 && (
          <div className="text-muted">&gt; (no events yet)</div>
        )}
      </div>
    </div>
  );
}