export type GameStatus = 'backlog' | 'playing' | 'completed' | 'dropped' | 'wishlist';

export type Platform = {
  id: number;
  name: string;
  shortName: string;
};

export type Game = {
  id: string;
  igdbId: number | null;
  title: string;
  coverUrl: string | null;
  summary: string | null;
  releaseYear: number | null;
};

export type GameEntry = {
  id: string;
  gameId: string;
  platformId: number;
  status: GameStatus;
  hoursPlayed: number;
  personalRating: number | null;
  notes: string | null;
  startedAt: number | null;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
  // joined fields
  game?: Game;
  platform?: Platform;
};