export type IGDBGame = {
  id: number;
  name: string;
  summary?: string;
  cover?: { image_id: string };
  first_release_date?: number;
  platforms?: { name: string }[];
};

export type GameSearchResult = {
  igdbId: number;
  title: string;
  coverUrl: string | null;
  summary: string | null;
  releaseYear: number | null;
};
