import type { WebSocket } from 'ws';
import type { GameState } from '../game/pong/types.js';
import type { GameSettings } from '../game/pong/settings.js';

export type MatchStatus =
  | 'WAITING'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'FINISHED'
  | 'ABORTED';

export type RemotePlayer = {
  userId: string;
  username: string;
  socket: WebSocket | null;
  disconnectedAt: number | null;
  ready: boolean;
  input: { up: boolean; down: boolean };
};

export type RemoteMatch = {
  id: string;
  host: RemotePlayer;
  guest: RemotePlayer | null;
  status: MatchStatus;
  settings: GameSettings;
  gameState: GameState;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  gameLoopHandle: NodeJS.Timeout | null;
  countdownHandle: NodeJS.Timeout | null;
  graceHandle: NodeJS.Timeout | null;
  lastTickAt: number;
  lastBroadcastAt: number;
};