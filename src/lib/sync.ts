import { getGameEntries } from "../db/queries/game";
import { supabase } from "./supabase";

export async function syncBacklogToSupabase(userId: string): Promise<void> {
  try {
    const entries = getGameEntries();
    if (entries.length === 0) return;

    const rows = entries.map((entry) => ({
      id: entry.id,
      user_id: userId,
      igdb_id: entry.game?.igdbId ?? null,
      title: entry.game?.title ?? "Unknown",
      cover_url: entry.game?.coverUrl ?? null,
      platform_id: entry.platformId ?? null,
      status: entry.status,
      personal_rating: entry.personalRating ?? null,
      hours_played: entry.hoursPlayed ?? 0,
      notes: entry.notes ?? null,
      is_public: true,
      created_at: new Date(entry.createdAt).toISOString(),
      updated_at: new Date(entry.updatedAt).toISOString(),
    }));

    const { error } = await supabase
      .from("game_entries")
      .upsert(rows, { onConflict: "id" });

    if (error) console.error("Sync error:", error.message);
    else console.log(`Synced ${rows.length} entries to Supabase`);
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

export async function syncSingleEntry(
  entryId: string,
  userId: string,
): Promise<void> {
  try {
    const entries = getGameEntries();
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const { error } = await supabase.from("game_entries").upsert(
      {
        id: entry.id,
        user_id: userId,
        igdb_id: entry.game?.igdbId ?? null,
        title: entry.game?.title ?? "Unknown",
        cover_url: entry.game?.coverUrl ?? null,
        platform_id: entry.platformId ?? null,
        status: entry.status,
        personal_rating: entry.personalRating ?? null,
        hours_played: entry.hoursPlayed ?? 0,
        notes: entry.notes ?? null,
        is_public: true,
        created_at: new Date(entry.createdAt).toISOString(),
        updated_at: new Date(entry.updatedAt).toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) console.error("Single sync error:", error.message);
  } catch (err) {
    console.error("Single sync failed:", err);
  }
}

export async function deleteSingleEntry(entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("game_entries")
      .delete()
      .eq("id", entryId);

    if (error) console.error("Delete sync error:", error.message);
  } catch (err) {
    console.error("Delete sync failed:", err);
  }
}
