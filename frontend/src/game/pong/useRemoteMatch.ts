import { useEffect, useRef, useState, useCallback } from 'react';
import { RemoteSocket, type WSMessage } from '../../api/websocket';
import type { GameState, Side } from './types';
import type { RemoteMatchDetail } from '../../api/remote';

type NetSide = 'LEFT' | 'RIGHT';

const toEngineSide = (s: NetSide): Side => (s === 'LEFT' ? 'left' : 'right');

export type RemoteStatus =
  | 'connecting'
  | 'attaching'
  | 'waiting_opponent'
  | 'waiting_ready'
  | 'opponent_ready'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'finished'
  | 'aborted'
  | 'disconnected';

export type RemoteMatchContext = {
  status: RemoteStatus;
  side: Side | null;
  game: GameState | null;
  countdown: number | null;
  winner: Side | null;
  finishReason: string | null;
  error: string | null;
  opponentConnected: boolean;
  match: RemoteMatchDetail | null;
  iAmReady: boolean;
};

type Options = {
  matchId: string;
};

export function useRemoteMatch({ matchId }: Options) {
  const [ctx, setCtx] = useState<RemoteMatchContext>({
    status: 'connecting',
    side: null,
    game: null,
    countdown: null,
    winner: null,
    finishReason: null,
    error: null,
    opponentConnected: false,
    match: null,
    iAmReady: false,
  });

  const socketRef = useRef<RemoteSocket | null>(null);

  useEffect(() => {
    const socket = new RemoteSocket({
      onOpen: () => {
        setCtx((c) => ({ ...c, status: 'attaching' }));
        socket.send({ type: 'attach', matchId });
      },
      onMessage: (msg: WSMessage) => {
        handleMessage(msg, setCtx);
      },
      onClose: () => {
        setCtx((c) => {
          if (c.status === 'finished' || c.status === 'aborted') return c;
          return { ...c, status: 'disconnected' };
        });
      },
      onError: () => {
        setCtx((c) => ({ ...c, error: 'WebSocket error' }));
      },
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.close();
    };
  }, [matchId]);

  const sendReady = useCallback(() => {
    socketRef.current?.send({ type: 'ready' });
  }, []);

  const sendInput = useCallback((up: boolean, down: boolean) => {
    socketRef.current?.send({ type: 'input', up, down });
  }, []);

  return { ...ctx, sendReady, sendInput };
}

function handleMessage(
  msg: WSMessage,
  setCtx: React.Dispatch<React.SetStateAction<RemoteMatchContext>>,
) {
  const m = msg as { type: string; [k: string]: unknown };

  switch (m.type) {
    case 'welcome':
      break;

    case 'attached': {
      const netSide = m.side as NetSide;
      const side = toEngineSide(netSide);
      const match = m.match as RemoteMatchDetail;
      setCtx((c) => ({
        ...c,
        status: match.guest ? 'waiting_ready' : 'waiting_opponent',
        side,
        match,
        opponentConnected: netSide === 'LEFT' ? !!match.guest : true,
      }));
      break;
    }

    case 'opponent_joined': {
      const match = m.match as RemoteMatchDetail;
      setCtx((c) => ({
        ...c,
        match,
        opponentConnected: true,
        status: c.status === 'waiting_opponent' ? 'waiting_ready' : c.status,
      }));
      break;
    }

    case 'opponent_reconnected':
      setCtx((c) => ({
        ...c,
        opponentConnected: true,
        status: c.status === 'paused' ? 'playing' : c.status,
      }));
      break;

    case 'opponent_disconnected':
      setCtx((c) => ({
        ...c,
        opponentConnected: false,
        status: c.status === 'playing' ? 'paused' : c.status,
      }));
      break;

    case 'opponent_ready':
      setCtx((c) => ({
        ...c,
        status: c.status === 'waiting_ready' ? 'opponent_ready' : c.status,
      }));
      break;

    case 'countdown':
      setCtx((c) => ({
        ...c,
        status: 'countdown',
        countdown: m.value as number,
      }));
      break;

    case 'state': {
      const game = m.game as GameState;
      setCtx((c) => ({
        ...c,
        status: game.status === 'finished' ? c.status : 'playing',
        game,
      }));
      break;
    }

    case 'finished': {
      const winnerRaw = m.winner as string;
      const winner: Side = winnerRaw.toLowerCase() === 'left' ? 'left' : 'right';
      const reason = (m.reason as string) ?? null;
      setCtx((c) => ({
        ...c,
        status: 'finished',
        winner,
        finishReason: reason,
      }));
      break;
    }

    case 'aborted':
      setCtx((c) => ({
        ...c,
        status: 'aborted',
        finishReason: (m.reason as string) ?? 'aborted',
      }));
      break;

    case 'error':
      setCtx((c) => ({ ...c, error: (m.message as string) ?? 'Unknown error' }));
      break;

    case 'ready_ack':
      setCtx((c) => ({ ...c, iAmReady: true }));
      break;
  }
}