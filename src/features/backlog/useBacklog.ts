import { useState, useEffect, useCallback } from "react";
import { GameEntry } from "../../types/game";
import { getGameEntries } from "../../db/queries/game";

export function useBacklog(filter: string) {
  const [games, setGames] = useState<GameEntry[]>([]);

  const load = useCallback(() => {
    const results = getGameEntries(filter === "all" ? undefined : filter);
    setGames(results);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return { games, reload: load };
}
