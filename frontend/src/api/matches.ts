import { api } from './client';

export type MatchMode = 'LOCAL' | 'AI' | 'REMOTE_1V1' | 'TOURNAMENT';
export type MatchSide = 'LEFT' | 'RIGHT';

export type CreateMatchParticipant = {
  alias: string;
  side: MatchSide;
  score: number;
  isCurrentUser: boolean;
};

export type CreateMatchPayload = {
  mode: MatchMode;
  winnerSide: MatchSide;
  startedAt: string;
  endedAt: string;
  participants: CreateMatchParticipant[];
};

export type MatchParticipantDTO = {
  alias: string;
  side: MatchSide;
  score: number;
  userId: string | null;
  isGuest: boolean;
};

export type MatchDTO = {
  id: string;
  gameType: 'PONG';
  mode: MatchMode;
  winnerSide: MatchSide;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  participants: MatchParticipantDTO[];
};

export const matchApi = {
  create: (payload: CreateMatchPayload) =>
    api.post<{ match: MatchDTO }>('/matches', payload),
  listMine: () => api.get<{ matches: MatchDTO[] }>('/matches/me'),
};