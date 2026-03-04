import { db } from "../schema";

export type BacklogStats = {
  total: number;
  byStatus: Record<string, number>;
  totalHours: number;
  avgRating: number | null;
  recentlyAdded: { title: string; createdAt: number }[];
  completionRate: number;
};

export function getStats(): BacklogStats {
  // Total por status
  const statusRows = db.getAllSync(
    `SELECT ge.status, COUNT(*) as count
     FROM game_entries ge
     GROUP BY ge.status`,
  ) as { status: string; count: number }[];

  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of statusRows) {
    byStatus[row.status] = row.count;
    total += row.count;
  }

  // Total horas
  const hoursRow = db.getFirstSync(
    `SELECT SUM(hours_played) as total FROM game_entries`,
  ) as { total: number | null };

  // Rating promedio
  const ratingRow = db.getFirstSync(
    `SELECT AVG(personal_rating) as avg FROM game_entries WHERE personal_rating IS NOT NULL`,
  ) as { avg: number | null };

  // Últimos agregados
  const recentRows = db.getAllSync(
    `SELECT g.title, ge.created_at
     FROM game_entries ge
     JOIN games g ON g.id = ge.game_id
     ORDER BY ge.created_at DESC
     LIMIT 5`,
  ) as { title: string; createdAt: number }[];

  const completed = byStatus["completed"] ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    byStatus,
    totalHours: hoursRow.total ?? 0,
    avgRating: ratingRow.avg ? Math.round(ratingRow.avg * 10) / 10 : null,
    recentlyAdded: recentRows,
    completionRate,
  };
}
