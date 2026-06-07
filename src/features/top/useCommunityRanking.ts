import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { getWeekStartISO } from "../../utils/week";

export type CommunityRankingRow = {
  igdb_id: number;
  title: string;
  cover_url: string | null;
  avg_rating: number;
  rating_count: number;
  rank: number;
  previousRank: number | null;
  change: number | null;
};

export function useCommunityRanking() {
  return useQuery<CommunityRankingRow[]>({
    queryKey: ["community-ranking"],
    queryFn: async () => {
      const { data: current, error: e1 } = await supabase
        .from("community_ranking")
        .select("igdb_id, title, cover_url, avg_rating, rating_count, rank")
        .order("rank", { ascending: true })
        .limit(100);

      if (e1) throw e1;
      if (!current) return [];

      const lastWeekStart = getWeekStartISO(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      );

      const { data: prev, error: e2 } = await supabase
        .from("community_rank_snapshots")
        .select("igdb_id, rank")
        .eq("week_start", lastWeekStart);

      if (e2) throw e2;

      const prevMap = new Map<number, number>(
        (prev ?? []).map((p) => [p.igdb_id, p.rank]),
      );

      return current.map((row) => {
        const previousRank = prevMap.get(row.igdb_id) ?? null;
        const change =
          previousRank !== null ? previousRank - row.rank : null;
        return { ...row, previousRank, change };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
