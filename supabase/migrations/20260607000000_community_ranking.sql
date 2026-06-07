-- =========================================================
-- Community ranking: vista + tabla de snapshots + reviews
-- =========================================================

-- Vista: ranking actual de la comunidad
CREATE OR REPLACE VIEW community_ranking AS
SELECT
  g.igdb_id,
  g.title,
  g.cover_url,
  g.release_year,
  ROUND(AVG(ge.personal_rating)::numeric, 1) AS avg_rating,
  COUNT(*) AS rating_count,
  RANK() OVER (
    ORDER BY AVG(ge.personal_rating) DESC,
             COUNT(*) DESC,
             g.igdb_id ASC
  ) AS rank
FROM games g
JOIN game_entries ge ON ge.game_id = g.id
WHERE ge.is_public = true
  AND ge.personal_rating IS NOT NULL
GROUP BY g.igdb_id, g.title, g.cover_url, g.release_year
HAVING COUNT(*) >= 3;

-- Tabla: snapshots semanales
CREATE TABLE IF NOT EXISTS community_rank_snapshots (
  igdb_id      INTEGER NOT NULL,
  week_start   DATE    NOT NULL,
  rank         INTEGER NOT NULL,
  avg_rating   NUMERIC(3,1) NOT NULL,
  rating_count INTEGER NOT NULL,
  PRIMARY KEY (igdb_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_week
  ON community_rank_snapshots(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_igdb
  ON community_rank_snapshots(igdb_id);

-- RLS: lectura pública
ALTER TABLE community_rank_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read snapshots" ON community_rank_snapshots;
CREATE POLICY "Public read snapshots"
  ON community_rank_snapshots
  FOR SELECT
  USING (true);

-- Sin policy de INSERT/UPDATE/DELETE para usuarios autenticados:
-- el único path de escritura es la Edge Function con service_role key.

-- Vista: reviews públicas
CREATE OR REPLACE VIEW community_reviews AS
SELECT
  ge.game_id,
  ge.personal_rating,
  ge.notes,
  ge.updated_at,
  p.id          AS user_id,
  p.username,
  p.display_name,
  p.avatar_url
FROM game_entries ge
JOIN profiles p ON p.id = ge.user_id
WHERE ge.is_public = true
  AND ge.personal_rating IS NOT NULL
  AND ge.notes IS NOT NULL
  AND LENGTH(TRIM(ge.notes)) > 0;

-- Grants (Supabase requiere estos para que el cliente lea las vistas)
-- Las vistas corren SECURITY DEFINER (default), por lo que NO heredan
-- las RLS de las tablas subyacentes. El WHERE is_public = true es la
-- garantía de privacidad.
GRANT SELECT ON community_ranking       TO anon, authenticated;
GRANT SELECT ON community_reviews       TO anon, authenticated;
GRANT SELECT ON community_rank_snapshots TO anon, authenticated;
