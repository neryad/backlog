import { mapIGDBGame } from "../types/igdb.mapper";
import { GameSearchResult, IGDBGame } from "../types/igdb.types";

const PROXY_URL =
  process.env.EXPO_PUBLIC_IGDB_PROXY_URL ??
  "https://gamelog-proxy.vercel.app/api/games";

export async function searchGames(query: string): Promise<GameSearchResult[]> {
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: `search "${query}"; fields name, summary, cover.image_id, first_release_date, platforms.name; limit 20;`,
  });

  if (!response.ok) throw new Error("IGDB request failed");

  const data: IGDBGame[] = await response.json();
  return data.map(mapIGDBGame);
}
