// import { useState, useCallback } from "react";
// import { GameEntry, GameStatus } from "../../types/game";
// import {
//   getGameEntryById,
//   updateGameEntry,
//   deleteGameEntry,
// } from "../../db/queries/game";
// import { useAuthStore } from "../../store/auth.store";
// import { syncSingleEntry, deleteSingleEntry } from "../../lib/sync";

// export function useGameDetail(id: string) {
//   const [entry, setEntry] = useState<GameEntry | null>(() =>
//     getGameEntryById(id),
//   );
//   const { session } = useAuthStore();

//   const reload = useCallback(() => {
//     setEntry(getGameEntryById(id));
//   }, [id]);

//   const syncIfLoggedIn = useCallback(() => {
//     if (session?.user?.id) {
//       syncSingleEntry(id, session.user.id);
//     }
//   }, [id, session]);

//   const setStatus = useCallback(
//     (status: GameStatus) => {
//       updateGameEntry(id, { status });
//       reload();
//       syncIfLoggedIn();
//     },
//     [id, reload, syncIfLoggedIn],
//   );

//   const setRating = useCallback(
//     (rating: number | null) => {
//       updateGameEntry(id, { personalRating: rating });
//       reload();
//       syncIfLoggedIn();
//     },
//     [id, reload, syncIfLoggedIn],
//   );

//   const setNotes = useCallback(
//     (notes: string) => {
//       updateGameEntry(id, { notes });
//       reload();
//       syncIfLoggedIn();
//     },
//     [id, reload, syncIfLoggedIn],
//   );

//   const setHours = useCallback(
//     (hours: number) => {
//       updateGameEntry(id, { hoursPlayed: hours });
//       reload();
//       syncIfLoggedIn();
//     },
//     [id, reload, syncIfLoggedIn],
//   );

//   const setIsPublic = useCallback(
//     (value: boolean) => {
//       updateGameEntry(id, { isPublic: value });
//       reload();
//       syncIfLoggedIn();
//     },
//     [id, reload, syncIfLoggedIn],
//   );

//   const remove = useCallback(() => {
//     deleteGameEntry(id);
//     if (session?.user?.id) {
//       deleteSingleEntry(id, session.user.id);
//     }
//   }, [id, session]);

//   return { entry, setStatus, setRating, setNotes, setHours, setIsPublic, remove };
// }

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
  const { session } = useAuthStore();

  const [entry, setEntry] = useState<GameEntry | null>(() =>
    getGameEntryById(id),
  );

  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(() => {
    setEntry(getGameEntryById(id));
  }, [id]);

  const syncIfLoggedIn = useCallback(() => {
    if (session?.user?.id) {
      syncSingleEntry(id, session.user.id);
    }
  }, [id, session]);

  /**
   * 🔥 CORE UPDATE (centralizado)
   */
  const update = useCallback(
    (patch: Partial<GameEntry>) => {
      try {
        setIsSaving(true);

        // ✅ Optimistic update (UI inmediata)
        setEntry((prev) =>
          prev ? { ...prev, ...patch } : prev,
        );

        updateGameEntry(id, patch);

        syncIfLoggedIn();
      } catch (error) {
        if (__DEV__) console.error("updateGameDetail error:", error);

        // fallback → recargar desde DB
        reload();
      } finally {
        setIsSaving(false);
      }
    },
    [id, reload, syncIfLoggedIn],
  );

  /**
   * 🔹 Acciones específicas (clean API)
   */
  const setStatus = useCallback(
    (status: GameStatus) => update({ status }),
    [update],
  );

  const setRating = useCallback(
    (rating: number | null) => update({ personalRating: rating }),
    [update],
  );

  const setNotes = useCallback(
    (notes: string) => update({ notes }),
    [update],
  );

  const setHours = useCallback(
    (hours: number) => update({ hoursPlayed: hours }),
    [update],
  );

  const setIsPublic = useCallback(
    (value: boolean) => update({ isPublic: value }),
    [update],
  );

  /**
   * 🗑 Delete
   */
  const remove = useCallback(() => {
    try {
      deleteGameEntry(id);

      if (session?.user?.id) {
        deleteSingleEntry(id, session.user.id);
      }

      setEntry(null);
    } catch (error) {
      if (__DEV__) console.error("deleteGameDetail error:", error);
    }
  }, [id, session]);

  return {
    entry,
    isSaving,

    // actions
    setStatus,
    setRating,
    setNotes,
    setHours,
    setIsPublic,
    remove,

    // opcional
    reload,
  };
}