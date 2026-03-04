import { useState, useEffect, useCallback } from "react";
import { GameEntry } from "../../types/game";
import { getGameEntries } from "../../db/queries/game";
import { useFocusEffect } from "expo-router";

export function useBacklog(filter: string) {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const results = getGameEntries(filter === "all" ? undefined : filter);
    setGames(results);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { games, loading, reload: load };
}
