import { useState, useCallback } from "react";
import { GameEntry, GameStatus } from "../../types/game";
import {
  getGameEntryById,
  updateGameEntry,
  deleteGameEntry,
} from "../../db/queries/game";

export function useGameDetail(id: string) {
  const [entry, setEntry] = useState<GameEntry | null>(() =>
    getGameEntryById(id),
  );

  const reload = useCallback(() => {
    setEntry(getGameEntryById(id));
  }, [id]);

  const setStatus = useCallback(
    (status: GameStatus) => {
      updateGameEntry(id, { status });
      reload();
    },
    [id, reload],
  );

  const setRating = useCallback(
    (rating: number | null) => {
      updateGameEntry(id, { personalRating: rating });
      reload();
    },
    [id, reload],
  );

  const setNotes = useCallback(
    (notes: string) => {
      updateGameEntry(id, { notes });
      reload();
    },
    [id, reload],
  );

  const setHours = useCallback(
    (hours: number) => {
      updateGameEntry(id, { hoursPlayed: hours });
      reload();
    },
    [id, reload],
  );

  const remove = useCallback(() => {
    deleteGameEntry(id);
  }, [id]);

  return { entry, setStatus, setRating, setNotes, setHours, remove };
}
