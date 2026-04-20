import { api } from './client';
import type { GameSettings } from '../game/pong/settings';

export type RemoteMatchStatus =
  | 'WAITING' | 'READY' | 'PLAYING' | 'PAUSED' | 'FINISHED' | 'ABORTED';

export type RemoteMatchSummary = {
  id: string;
  hostUsername: string;
  settings: GameSettings;
  createdAt: number;
};

export type RemoteMatchDetail = {
  id: string;
  status: RemoteMatchStatus;
  settings: GameSettings;
  host: { username: string };
  guest: { username: string } | null;
  isParticipant?: boolean;
};

export const remoteApi = {
  list: () => api.get<{ matches: RemoteMatchSummary[] }>('/remote/matches'),
  create: (settings: GameSettings) =>
    api.post<{ match: RemoteMatchDetail }>('/remote/matches', { settings }),
  get: (id: string) =>
    api.get<{ match: RemoteMatchDetail }>(`/remote/matches/${id}`),
  join: (id: string) =>
    api.post<{ match: RemoteMatchDetail }>(`/remote/matches/${id}/join`),
};