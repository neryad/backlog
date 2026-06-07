-- =========================================================
-- Programar el snapshot semanal de community_ranking
-- =========================================================
-- Requisitos previos (habilitar en Supabase Dashboard):
--   1. Database → Extensions → pg_cron → Enable
--   2. Database → Extensions → pg_net → Enable (para net.http_post)
--   3. Settings → Database → Custom config:
--        app.cron_secret   = '<tu CRON_SECRET>'
--        app.supabase_url  = 'https://<project>.supabase.co'
--
-- Si no se configuran los settings, la migration avisa con un NOTICE
-- y NO crea el schedule (para no fallar en ambientes parcialmente configurados).

DO $$
DECLARE
  cron_secret TEXT;
  supabase_url TEXT;
BEGIN
  BEGIN
    cron_secret := current_setting('app.cron_secret', true);
  EXCEPTION WHEN OTHERS THEN
    cron_secret := NULL;
  END;

  BEGIN
    supabase_url := current_setting('app.supabase_url', true);
  EXCEPTION WHEN OTHERS THEN
    supabase_url := NULL;
  END;

  IF cron_secret IS NULL OR supabase_url IS NULL THEN
    RAISE NOTICE 'pg_cron schedule NOT created: set app.cron_secret and app.supabase_url in Database settings';
  ELSE
    PERFORM cron.schedule(
      'weekly-community-snapshot',
      '0 0 * * 1',
      format(
        $cron$
        SELECT net.http_post(
          url := %L,
          headers := jsonb_build_object(
            'Authorization', 'Bearer ' || %L,
            'Content-Type',  'application/json'
          ),
          body := '{}'::jsonb
        );
        $cron$,
        supabase_url || '/functions/v1/weekly-snapshot',
        cron_secret
      )
    );
  END IF;
END $$;
