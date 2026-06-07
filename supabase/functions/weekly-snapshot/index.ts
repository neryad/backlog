// @ts-nocheck
// Edge Function — runs on Deno runtime.
// Triggered weekly by pg_cron. Snapshots the top 100 of community_ranking
// into community_rank_snapshots, keyed by week_start (Monday of current week).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  const expected = `Bearer ${Deno.env.get("CRON_SECRET")}`;

  if (!authHeader || authHeader !== expected) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing env vars" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setUTCDate(monday.getUTCDate() + diff);
    const weekStart = monday.toISOString().split("T")[0];

    const { data: ranking, error: rankingError } = await supabase
      .from("community_ranking")
      .select("igdb_id, avg_rating, rating_count, rank")
      .order("rank", { ascending: true })
      .limit(100);

    if (rankingError) throw rankingError;

    if (!ranking || ranking.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          week_start: weekStart,
          inserted: 0,
          message: "No games with 3+ ratings yet",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const rows = ranking.map((r) => ({
      igdb_id: r.igdb_id,
      week_start: weekStart,
      rank: r.rank,
      avg_rating: r.avg_rating,
      rating_count: r.rating_count,
    }));

    const { error: upsertError } = await supabase
      .from("community_rank_snapshots")
      .upsert(rows, { onConflict: "igdb_id,week_start" });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({
        ok: true,
        week_start: weekStart,
        inserted: rows.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
