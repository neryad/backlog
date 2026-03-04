import { useQuery } from "@tanstack/react-query";
import { searchGames } from "../../api/igdb.client";

export function useGameSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchGames(query),
    enabled: query.trim().length > 2,
    staleTime: 5 * 60 * 1000,
  });
}
