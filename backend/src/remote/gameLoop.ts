import type { RemoteMatch } from './types.js';
import type { Input } from '../game/pong/types.js';
import { updateGame } from '../game/pong/engine.js';
import { resolveSettings } from '../game/pong/settings.js';
import { remoteRegistry } from './registry.js';

const TICK_RATE = 60;
const TICK_INTERVAL_MS = 1000 / TICK_RATE;
const BROADCAST_INTERVAL_MS = 1000 / 30;
const GRACE_PERIOD_MS = 15_000;

export function startMatch(match: RemoteMatch): void {
  if (match.status !== 'READY') return;

  let countdownValue = 3;
  remoteRegistry.broadcast(match, { type: 'countdown', value: countdownValue });

  const tick = () => {
    countdownValue--;
    if (countdownValue > 0) {
      remoteRegistry.broadcast(match, { type: 'countdown', value: countdownValue });
      match.countdownHandle = setTimeout(tick, 1000);
    } else {
      match.status = 'PLAYING';
      match.startedAt = Date.now();
      match.lastTickAt = Date.now();
      match.lastBroadcastAt = 0;
      match.countdownHandle = null;

      const resolved = resolveSettings(match.settings);
      const angle = (Math.random() - 0.5) * (Math.PI / 2);
      const direction = Math.random() < 0.5 ? -1 : 1;
      match.gameState = {
        ...match.gameState,
        status: 'playing',
        ball: {
          ...match.gameState.ball,
          vx: Math.cos(angle) * resolved.ballInitialSpeed * direction,
          vy: Math.sin(angle) * resolved.ballInitialSpeed,
        },
      };

      match.gameLoopHandle = setInterval(() => runTick(match), TICK_INTERVAL_MS);
    }
  };

  match.countdownHandle = setTimeout(tick, 1000);
}

function runTick(match: RemoteMatch): void {
  if (match.status !== 'PLAYING') return;

  const now = Date.now();
  const dt = Math.min((now - match.lastTickAt) / 1000, 0.05);
  match.lastTickAt = now;

  const input: Input = {
    leftUp: match.host.input.up,
    leftDown: match.host.input.down,
    rightUp: match.guest?.input.up ?? false,
    rightDown: match.guest?.input.down ?? false,
  };

  if (now % 1000 < 20) {
    console.log('[tick]', 'host input:', match.host.input, 'guest input:', match.guest?.input);
  }

  const resolved = resolveSettings(match.settings);
  const prev = match.gameState;
  match.gameState = updateGame(prev, input, dt, resolved, now);

  if (prev.status === 'playing' && match.gameState.status === 'finished') {
    finishMatch(match);
    return;
  }

  if (now - match.lastBroadcastAt >= BROADCAST_INTERVAL_MS) {
    match.lastBroadcastAt = now;
    remoteRegistry.broadcast(match, {
      type: 'state',
      game: match.gameState,
    });
  }
}

function finishMatch(match: RemoteMatch): void {
  match.status = 'FINISHED';
  match.endedAt = Date.now();
  if (match.gameLoopHandle) {
    clearInterval(match.gameLoopHandle);
    match.gameLoopHandle = null;
  }

  remoteRegistry.broadcast(match, {
    type: 'state',
    game: match.gameState,
  });
  remoteRegistry.broadcast(match, {
    type: 'finished',
    winner: match.gameState.winner,
    score: match.gameState.score,
  });

  setTimeout(() => remoteRegistry.remove(match.id), 30_000);
}

export function handlePlayerDisconnect(
  match: RemoteMatch,
  side: 'LEFT' | 'RIGHT',
): void {
  if (match.status === 'FINISHED' || match.status === 'ABORTED') return;

  if (match.status === 'PLAYING') {
    match.status = 'PAUSED';
    if (match.gameLoopHandle) {
      clearInterval(match.gameLoopHandle);
      match.gameLoopHandle = null;
    }
  }

  match.graceHandle = setTimeout(() => {
    const player = side === 'LEFT' ? match.host : match.guest;
    if (player?.socket) return;

    const winner = side === 'LEFT' ? 'right' : 'left';
    match.status = 'FINISHED';
    match.endedAt = Date.now();
    match.gameState = { ...match.gameState, status: 'finished', winner };

    remoteRegistry.broadcast(match, {
      type: 'finished',
      winner,
      score: match.gameState.score,
      reason: 'opponent_timeout',
    });
    setTimeout(() => remoteRegistry.remove(match.id), 30_000);
  }, GRACE_PERIOD_MS);
}

export function handlePlayerReconnect(match: RemoteMatch): void {
  if (match.graceHandle) {
    clearTimeout(match.graceHandle);
    match.graceHandle = null;
  }

  if (match.status === 'PAUSED') {
    if (match.host.socket && match.guest?.socket) {
      match.status = 'PLAYING';
      match.lastTickAt = Date.now();
      match.lastBroadcastAt = 0;
      match.gameLoopHandle = setInterval(() => runTick(match), TICK_INTERVAL_MS);
    }
  }
}