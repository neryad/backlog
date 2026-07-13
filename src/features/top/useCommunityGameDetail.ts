import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { getWeekStartISO } from "../../utils/week";

export type CommunityReview = {
  igdb_id: number;
  personal_rating: number;
  notes: string;
  updated_at: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type CommunityGameDetail = {
  game: {
    igdb_id: number;
    title: string;
    cover_url: string | null;
  } | null;
  ranking: {
    igdb_id: number;
    title: string;
    cover_url: string | null;
    avg_rating: number;
    rating_count: number;
    rank: number;
  } | null;
  reviews: CommunityReview[];
  previousRank: number | null;
  change: number | null;
};

export function useCommunityGameDetail(igdbId: number) {
  return useQuery<CommunityGameDetail | null>({
    queryKey: ["community-game", igdbId],
    queryFn: async () => {
      const { data: ranking, error: rErr } = await supabase
        .from("community_ranking")
        .select("igdb_id, title, cover_url, avg_rating, rating_count, rank")
        .eq("igdb_id", igdbId)
        .maybeSingle();

      if (rErr) throw rErr;
      if (!ranking) return null;

      const { data: reviews, error: revErr } = await supabase
        .from("community_reviews")
        .select(
          "igdb_id, personal_rating, notes, updated_at, user_id, username, display_name, avatar_url",
        )
        .eq("igdb_id", igdbId)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (revErr) throw revErr;

      const lastWeekStart = getWeekStartISO(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      );

      const { data: prev } = await supabase
        .from("community_rank_snapshots")
        .select("rank")
        .eq("igdb_id", igdbId)
        .eq("week_start", lastWeekStart)
        .maybeSingle();

      const previousRank = prev?.rank ?? null;
      const change =
        previousRank !== null ? previousRank - ranking.rank : null;

      return {
        game: {
          igdb_id: ranking.igdb_id,
          title: ranking.title,
          cover_url: ranking.cover_url,
        },
        ranking,
        reviews: (reviews ?? []) as CommunityReview[],
        previousRank,
        change,
      };
    },
    enabled: Number.isFinite(igdbId) && igdbId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
