import { IGDBGame, GameSearchResult } from "./igdb.types";

export function mapIGDBGame(raw: IGDBGame): GameSearchResult {
  return {
    igdbId: raw.id,
    title: raw.name,
    coverUrl: raw.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${raw.cover.image_id}.jpg`
      : null,
    summary: raw.summary ?? null,
    releaseYear: raw.first_release_date
      ? new Date(raw.first_release_date * 1000).getFullYear()
      : null,
  };
}
