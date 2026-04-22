import { useState, useEffect, useCallback } from "react";
import { GameEntry } from "../../types/game";
import { getGameEntries } from "../../db/queries/game";
import { useFocusEffect } from "expo-router";

export function useBacklog(filter: string) {
  // Lazy initializer: carga síncrona en el primer render, evita el ciclo
  // loading→true→false causado por llamar setLoading antes de una op síncrona.
  const [games, setGames] = useState<GameEntry[]>(() =>
    getGameEntries(filter === "all" ? undefined : filter),
  );
  // getGameEntries es síncrono: loading siempre es false tras el init.
  const loading = false;

  const load = useCallback(() => {
    const results = getGameEntries(filter === "all" ? undefined : filter);
    setGames(results);
  }, [filter]);

  // Solo cuando cambia el filtro (no depende de `load` para evitar el doble disparo).
  useEffect(() => {
    load();
  }, [filter]);

  // Re-carga al volver a la pantalla (ej: después de editar un juego).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { games, loading, reload: load };
}
