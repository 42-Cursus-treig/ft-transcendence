import crypto from 'node:crypto';
import type { RemoteMatch, RemotePlayer } from './types.js';
import type { GameSettings } from '../game/pong/settings.js';
import { resolveSettings } from '../game/pong/settings.js';
import { createInitialState } from '../game/pong/engine.js';

class RemoteMatchRegistry {
  private matches = new Map<string, RemoteMatch>();

  create(host: Omit<RemotePlayer, 'ready' | 'disconnectedAt'>, settings: GameSettings): RemoteMatch {
    const id = crypto.randomUUID();
    const resolved = resolveSettings(settings);

    const match: RemoteMatch = {
      id,
      host: { ...host, ready: false, disconnectedAt: null, input: { up: false, down: false } },
      guest: null,
      status: 'WAITING',
      settings,
      gameState: createInitialState(resolved),
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      gameLoopHandle: null,
      countdownHandle: null,
      graceHandle: null,
      lastTickAt: 0,
      lastBroadcastAt: 0,
    };

    this.matches.set(id, match);
    return match;
  }

  get(id: string): RemoteMatch | null {
    return this.matches.get(id) ?? null;
  }

  listWaiting(): Array<{
    id: string;
    hostUsername: string;
    settings: GameSettings;
    createdAt: number;
  }> {
    const result: Array<{
      id: string;
      hostUsername: string;
      settings: GameSettings;
      createdAt: number;
    }> = [];
    for (const m of this.matches.values()) {
      if (m.status === 'WAITING' && m.guest === null) {
        result.push({
          id: m.id,
          hostUsername: m.host.username,
          settings: m.settings,
          createdAt: m.createdAt,
        });
      }
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }

  findActiveForUser(userId: string): RemoteMatch | null {
    for (const m of this.matches.values()) {
      if (m.status === 'FINISHED' || m.status === 'ABORTED') continue;
      if (m.host.userId === userId) return m;
      if (m.guest?.userId === userId) return m;
    }
    return null;
  }

  remove(id: string): void {
    const m = this.matches.get(id);
    if (m?.gameLoopHandle) clearInterval(m.gameLoopHandle);
    if (m?.countdownHandle) clearTimeout(m.countdownHandle);
    if (m?.graceHandle) clearTimeout(m.graceHandle);
    this.matches.delete(id);
  }

  abort(id: string, reason: string): void {
    const m = this.matches.get(id);
    if (!m) return;
    m.status = 'ABORTED';
    m.endedAt = Date.now();
    if (m.gameLoopHandle) clearInterval(m.gameLoopHandle);
    if (m.countdownHandle) clearTimeout(m.countdownHandle);
    if (m.graceHandle) clearTimeout(m.graceHandle);
    m.gameLoopHandle = null;
    m.countdownHandle = null;
    m.graceHandle = null;
    setTimeout(() => this.remove(id), 30_000);
    console.log(`[registry] Match ${id} aborted: ${reason}`);
  }

  size(): number {
    return this.matches.size;
  }

  sendToPlayer(match: RemoteMatch, side: 'LEFT' | 'RIGHT', message: unknown): void {
    const player = side === 'LEFT' ? match.host : match.guest;
    if (!player?.socket) return;
    if (player.socket.readyState !== 1) return;
    player.socket.send(JSON.stringify(message));
  }

  broadcast(match: RemoteMatch, message: unknown): void {
    const payload = JSON.stringify(message);
    for (const p of [match.host, match.guest]) {
        if (!p?.socket) continue;
        if (p.socket.readyState !== 1) continue;
        p.socket.send(payload);
    }
  }
}

export const remoteRegistry = new RemoteMatchRegistry();