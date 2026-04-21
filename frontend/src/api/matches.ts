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

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type ListMineResponse = {
  matches: MatchDTO[];
  pagination: Pagination;
};

export const matchApi = {
  create: (payload: CreateMatchPayload) =>
    api.post<{ match: MatchDTO }>('/matches', payload),
  
  listMine: async (page = 1, pageSize = 10): Promise<ListMineResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return api.get<ListMineResponse>(`/matches/me?${params}`);
  },
};