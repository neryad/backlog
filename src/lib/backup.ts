import { Alert } from "react-native";
import { db } from "../db/schema";
import { supabase } from "./supabase";
import { useUIStore } from "../store/ui.store";
import { v4 as uuidv4 } from "uuid";

type SupabaseEntry = {
  id: string;
  user_id: string;
  igdb_id: number | null;
  title: string | null;
  cover_url: string | null;
  platform_id: number | null;
  status: string | null;
  personal_rating: number | null;
  hours_played: number | null;
  notes: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

async function restoreFromSupabase(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const { data, error } = await supabase
    .from("game_entries")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      message: "No cloud data found for this account",
    };
  }

  const entries = data as SupabaseEntry[];

  db.execSync("BEGIN TRANSACTION");
  try {
    db.execSync("DELETE FROM game_entries");
    db.execSync("DELETE FROM games");

    const now = Date.now();
    let gamesInserted = 0;
    let entriesInserted = 0;

    for (const entry of entries) {
      let gameId: string | null = null;

      if (entry.igdb_id != null) {
        const existing = db.getFirstSync(
          "SELECT id FROM games WHERE igdb_id = ?",
          [entry.igdb_id],
        ) as { id: string } | null;
        if (existing) {
          gameId = existing.id;
        }
      }

      if (!gameId) {
        gameId = uuidv4();
        db.runSync(
          `INSERT INTO games (id, igdb_id, title, cover_url, summary, release_year, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            gameId,
            entry.igdb_id,
            entry.title ?? "Unknown",
            entry.cover_url,
            null,
            null,
            now,
            now,
          ],
        );
        gamesInserted++;
      }

      db.runSync(
        `INSERT INTO game_entries (id, game_id, platform_id, status, hours_played, personal_rating, notes, started_at, completed_at, created_at, updated_at, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          gameId,
          entry.platform_id ?? 0,
          entry.status ?? "backlog",
          entry.hours_played ?? 0,
          entry.personal_rating ?? null,
          entry.notes ?? null,
          null,
          null,
          entry.created_at ? new Date(entry.created_at).getTime() : now,
          entry.updated_at ? new Date(entry.updated_at).getTime() : now,
          entry.is_public ? 1 : 0,
        ],
      );
      entriesInserted++;
    }

    db.execSync("COMMIT");
    useUIStore.getState().bumpRestoreVersion();
    return {
      success: true,
      message: `Restored ${entriesInserted} entries (${gamesInserted} games) from cloud`,
    };
  } catch (error) {
    db.execSync("ROLLBACK");
    return { success: false, message: `Restore failed: ${String(error)}` };
  }
}

export function confirmRestoreFromCloud(
  userId: string,
  onComplete: () => void,
): void {
  Alert.alert(
    "Restore from Cloud",
    "This will replace ALL your current local data with what's saved in the cloud. This cannot be undone. Continue?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        style: "destructive",
        onPress: async () => {
          const result = await restoreFromSupabase(userId);
          Alert.alert(
            result.success ? "Restored" : "Error",
            result.message,
            [{ text: "OK", onPress: onComplete }],
          );
        },
      },
    ],
  );
}
