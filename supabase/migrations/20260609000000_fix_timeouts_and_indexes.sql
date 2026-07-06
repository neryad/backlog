-- =========================================================
-- Fix timeouts en community_ranking y queries comunes
-- =========================================================
-- Correr en SQL Editor de Supabase

-- Índice para DISTINCT ON (igdb_id) ORDER BY updated_at DESC
-- Usado por la vista community_ranking
DROP INDEX IF EXISTS idx_game_entries_igdb_updated;
CREATE INDEX idx_game_entries_igdb_updated
  ON game_entries(igdb_id, updated_at DESC);

-- Índice para AVG(personal_rating), COUNT(*), HAVING COUNT(*) >= 3
-- Usado por la vista community_ranking (partial: solo filas con rating)
DROP INDEX IF EXISTS idx_game_entries_igdb_rating;
CREATE INDEX idx_game_entries_igdb_rating
  ON game_entries(igdb_id, personal_rating)
  WHERE personal_rating IS NOT NULL;

-- Índice para JOIN con profiles (user_id) + filtro is_public
-- Usado por la vista community_reviews (partial: solo filas públicas con rating)
DROP INDEX IF EXISTS idx_game_entries_user_public;
CREATE INDEX idx_game_entries_user_public
  ON game_entries(user_id, is_public)
  WHERE is_public = true AND personal_rating IS NOT NULL;
