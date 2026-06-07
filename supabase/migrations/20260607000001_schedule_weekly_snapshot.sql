-- =========================================================
-- Programar el snapshot semanal de community_ranking
-- =========================================================
-- Requisito previo: Database → Extensions → pg_cron + pg_net (ambas en pg_catalog)

SELECT cron.schedule(
  'weekly-community-snapshot',
  '0 0 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://eawkqkrzbzhyprgutqbr.supabase.co/functions/v1/weekly-snapshot',
    headers := jsonb_build_object(
      'Authorization', 'Bearer 33eb1052359df4a32fc79f59146649029302935f130dde086d2f18e69118dcea',
      'Content-Type',  'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
