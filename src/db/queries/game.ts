// import { db } from "../schema";
// import { GameEntry } from "../../types/game";

// export function getGameEntries(status?: string): GameEntry[] {
//   if (status) {
//     return db.getAllSync(
//       `SELECT ge.*, g.title, g.cover_url, g.release_year
//        FROM game_entries ge
//        JOIN games g ON g.id = ge.game_id
//        WHERE ge.status = ?
//        ORDER BY ge.created_at DESC
//        LIMIT 500`,
//       [status],
//     ) as GameEntry[];
//   }

//   return db.getAllSync(
//     `SELECT ge.*, g.title, g.cover_url, g.release_year
//      FROM game_entries ge
//      JOIN games g ON g.id = ge.game_id
//      ORDER BY ge.created_at DESC
//      LIMIT 500`,
//   ) as GameEntry[];
// }

// export function updateEntryStatus(id: string, status: string): void {
//   db.runSync(
//     `UPDATE game_entries SET status = ?, updated_at = ? WHERE id = ?`,
//     [status, Date.now(), id],
//   );
// }
import { db } from "../schema";
import { Game, GameEntry } from "../../types/game";
import { v4 as uuidv4 } from "uuid";
import { GameSearchResult } from "../../types/igdb.types";

// function mapEntry(row: any): GameEntry {
//   return {
//     id: row.id,
//     gameId: row.game_id,
//     platformId: row.platform_id,
//     status: row.status,
//     hoursPlayed: row.hours_played,
//     personalRating: row.personal_rating,
//     notes: row.notes,
//     startedAt: row.started_at,
//     completedAt: row.completed_at,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//     game: row.title
//       ? ({
//           id: row.game_id,
//           igdbId: row.igdb_id,
//           title: row.title,
//           coverUrl: row.cover_url,
//           summary: null,
//           releaseYear: row.release_year,
//         } as Game)
//       : undefined,
//   };
// }

function mapEntry(row: any): GameEntry {
  return {
    id: row.id,
    gameId: row.game_id,
    platformId: row.platform_id,
    status: row.status,
    hoursPlayed: row.hours_played,
    personalRating: row.personal_rating,
    notes: row.notes,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    game: row.title
      ? ({
          id: row.game_id,
          igdbId: row.igdb_id,
          title: row.title,
          coverUrl: row.cover_url,
          summary: row.summary ?? null,
          releaseYear: row.release_year,
        } as Game)
      : undefined,
  };
}

export function getGameEntries(status?: string): GameEntry[] {
  const rows = status
    ? db.getAllSync(
        `SELECT ge.*, g.title, g.cover_url, g.release_year, g.igdb_id
         FROM game_entries ge
         JOIN games g ON g.id = ge.game_id
         WHERE ge.status = ?
         ORDER BY ge.created_at DESC
         LIMIT 500`,
        [status],
      )
    : db.getAllSync(
        `SELECT ge.*, g.title, g.cover_url, g.release_year, g.igdb_id
         FROM game_entries ge
         JOIN games g ON g.id = ge.game_id
         ORDER BY ge.created_at DESC
         LIMIT 500`,
      );

  return (rows as any[]).map(mapEntry);
}

export function updateEntryStatus(id: string, status: string): void {
  console.log("Updating entry status:", { id, status });
  db.runSync(
    `UPDATE game_entries SET status = ?, updated_at = ? WHERE id = ?`,
    [status, Date.now(), id],
  );
}

export function insertGame(data: GameSearchResult): string {
  const id = uuidv4();
  const now = Date.now();

  db.runSync(
    `INSERT OR IGNORE INTO games (id, igdb_id, title, cover_url, summary, release_year, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.igdbId,
      data.title,
      data.coverUrl,
      data.summary,
      data.releaseYear,
      now,
      now,
    ],
  );

  return id;
}

export function insertGameEntry(
  gameId: string,
  platformId: number,
  status: string,
): string {
  const id = uuidv4();
  const now = Date.now();

  db.runSync(
    `INSERT INTO game_entries (id, game_id, platform_id, status, hours_played, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
    [id, gameId, platformId, status, now, now],
  );

  return id;
}

export function gameExistsByIgdbId(igdbId: number): string | null {
  const row = db.getFirstSync(`SELECT id FROM games WHERE igdb_id = ?`, [
    igdbId,
  ]) as { id: string } | null;

  return row?.id ?? null;
}
export function getGameEntryById(id: string): GameEntry | null {
  const row = db.getFirstSync(
    `SELECT ge.*, g.title, g.cover_url, g.release_year, g.igdb_id, g.summary
     FROM game_entries ge
     JOIN games g ON g.id = ge.game_id
     WHERE ge.id = ?`,
    [id],
  ) as any;

  if (!row) return null;
  return mapEntry(row);
}

export function updateGameEntry(
  id: string,
  fields: {
    status?: string;
    personalRating?: number | null;
    notes?: string | null;
    hoursPlayed?: number;
  },
): void {
  const sets: string[] = [];
  const values: any[] = [];

  if (fields.status !== undefined) {
    sets.push("status = ?");
    values.push(fields.status);
  }
  if (fields.personalRating !== undefined) {
    sets.push("personal_rating = ?");
    values.push(fields.personalRating);
  }
  if (fields.notes !== undefined) {
    sets.push("notes = ?");
    values.push(fields.notes);
  }
  if (fields.hoursPlayed !== undefined) {
    sets.push("hours_played = ?");
    values.push(fields.hoursPlayed);
  }

  sets.push("updated_at = ?");
  values.push(Date.now());
  values.push(id);

  db.runSync(`UPDATE game_entries SET ${sets.join(", ")} WHERE id = ?`, values);
}

export function deleteGameEntry(id: string): void {
  db.runSync(`DELETE FROM game_entries WHERE id = ?`, [id]);
}
