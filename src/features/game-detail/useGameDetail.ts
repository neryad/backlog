import { useState, useCallback } from "react";
import { GameEntry, GameStatus } from "../../types/game";
import {
  getGameEntryById,
  updateGameEntry,
  deleteGameEntry,
} from "../../db/queries/game";
import { useAuthStore } from "../../store/auth.store";
import { syncSingleEntry, deleteSingleEntry } from "../../lib/sync";

export function useGameDetail(id: string) {
  const [entry, setEntry] = useState<GameEntry | null>(() =>
    getGameEntryById(id),
  );
  const { session } = useAuthStore();

  const reload = useCallback(() => {
    setEntry(getGameEntryById(id));
  }, [id]);

  const syncIfLoggedIn = useCallback(() => {
    if (session?.user?.id) {
      syncSingleEntry(id, session.user.id);
    }
  }, [id, session]);

  const setStatus = useCallback(
    (status: GameStatus) => {
      updateGameEntry(id, { status });
      reload();
      syncIfLoggedIn();
    },
    [id, reload, syncIfLoggedIn],
  );

  const setRating = useCallback(
    (rating: number | null) => {
      updateGameEntry(id, { personalRating: rating });
      reload();
      syncIfLoggedIn();
    },
    [id, reload, syncIfLoggedIn],
  );

  const setNotes = useCallback(
    (notes: string) => {
      updateGameEntry(id, { notes });
      reload();
      syncIfLoggedIn();
    },
    [id, reload, syncIfLoggedIn],
  );

  const setHours = useCallback(
    (hours: number) => {
      updateGameEntry(id, { hoursPlayed: hours });
      reload();
      syncIfLoggedIn();
    },
    [id, reload, syncIfLoggedIn],
  );

  const setIsPublic = useCallback(
    (value: boolean) => {
      updateGameEntry(id, { isPublic: value });
      reload();
      syncIfLoggedIn();
    },
    [id, reload, syncIfLoggedIn],
  );

  const remove = useCallback(() => {
    deleteGameEntry(id);
    if (session?.user?.id) {
      deleteSingleEntry(id, session.user.id);
    }
  }, [id, session]);

  return { entry, setStatus, setRating, setNotes, setHours, setIsPublic, remove };
}
