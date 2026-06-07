# Top — Ranking de la comunidad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar una tab "Top" a Playlogged que muestra los 100 juegos mejor calificados por la comunidad global, con indicador de cambio semanal y vista detallada de reviews públicas.

**Architecture:** Vista PostgreSQL agrega ratings en Supabase. Una Edge Function programada con `pg_cron` persiste snapshots semanales en una tabla. La app cliente lee la vista + el snapshot para calcular el cambio de posición, y una vista adicional expone las reviews públicas con perfil de usuario. No se agregan columnas a tablas existentes.

**Tech Stack:** Expo SDK 55 (React Native 0.83.6), TypeScript, Expo Router, TanStack Query, Supabase (PostgreSQL + Edge Functions + pg_cron).

**Spec:** [`docs/superpowers/specs/20260607-top-community-ranking-design.md`](../specs/20260607-top-community-ranking-design.md)

---

## Nota sobre verificación

Este proyecto **no tiene framework de tests** (ver `AGENTS.md`: "No lint/test scripts — Project has no ESLint, Prettier, or test suite configured"). Por lo tanto, los pasos de "test" se reemplazan por:

- **Backend:** queries SQL de verificación ejecutadas en el SQL editor de Supabase.
- **Frontend:** `npx tsc --noEmit` para verificar tipos, y checklist de verificación manual.
- **Edge Function:** `curl` con el secret correcto/incorrecto.

Cada tarea incluye comandos exactos y output esperado.

---

## File Structure

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `supabase/migrations/20260607000000_community_ranking.sql` | Crear | Vista + tabla + RLS + grants |
| `supabase/migrations/20260607000001_schedule_weekly_snapshot.sql` | Crear | pg_cron schedule |
| `supabase/functions/weekly-snapshot/index.ts` | Crear | Edge Function Deno |
| `supabase/functions/weekly-snapshot/deno.json` | Crear | Config Deno |
| `src/utils/week.ts` | Crear | Helper `getWeekStartISO` |
| `src/features/top/useCommunityRanking.ts` | Crear | Hook TanStack Query |
| `src/features/top/useCommunityGameDetail.ts` | Crear | Hook TanStack Query |
| `src/features/top/RankBadge.tsx` | Crear | Componente badge ▲▼—NEW |
| `src/features/top/RankingListItem.tsx` | Crear | Componente item de lista |
| `app/(tabs)/top.tsx` | Crear | Pantalla de ranking |
| `app/community/game/[igdbId].tsx` | Crear | Pantalla de detalle |
| `app/(tabs)/_layout.tsx` | Modificar | Agregar tab "Top" |
| `.env.example` | Modificar | Documentar `CRON_SECRET` |

---

## Task 1: Crear migration SQL con vista, tabla, RLS y grants

**Files:**
- Create: `supabase/migrations/20260607000000_community_ranking.sql`

- [ ] **Step 1: Crear el archivo de migration**

```bash
mkdir -p supabase/migrations
```

Escribir el contenido completo en `supabase/migrations/20260607000000_community_ranking.sql`:

```sql
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
    ORDER BY AVG(ge.personal_rating) DESC, COUNT(*) DESC
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
```

- [ ] **Step 2: Verificar sintaxis localmente (opcional, requiere psql)**

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260607000000_community_ranking.sql --dry-run 2>&1 || true
```

Esperado: errores de conexión aceptables; el archivo se lee sin errores de sintaxis SQL.

Si no tienes `psql`, saltar este paso. La verificación real es en Supabase.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260607000000_community_ranking.sql
git commit -m "feat(db): add community_ranking view, snapshots table and reviews view"
```

---

## Task 2: Aplicar la migration en Supabase

**Files:**
- Modify: Supabase DB (vía dashboard o CLI)

- [ ] **Step 1: Aplicar la migration**

Opción A — Supabase CLI (recomendado):
```bash
supabase db push --include-all
```

Opción B — Dashboard:
1. Abrir https://app.supabase.com/project/<tu-proyecto>/sql/new
2. Pegar el contenido de `supabase/migrations/20260607000000_community_ranking.sql`
3. Click "Run"

Esperado: "Success. No rows returned" o equivalente (las vistas no devuelven rows al crearse).

- [ ] **Step 2: Verificar que la vista existe y respeta el filtro de 3 ratings**

En el SQL editor de Supabase, ejecutar:

```sql
-- Debe devolver 0 filas si no hay datos públicos con 3+ ratings todavía
SELECT COUNT(*) FROM community_ranking;

-- Verificar que la tabla existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'community_rank_snapshots'
ORDER BY ordinal_position;
```

Esperado: `count = 0` (o N si ya hay datos). La segunda query devuelve 5 columnas: `igdb_id`, `week_start`, `rank`, `avg_rating`, `rating_count`.

- [ ] **Step 3: Insertar datos de prueba temporales para verificar el ranking**

En el SQL editor:

```sql
-- ⚠️ SOLO PARA DESARROLLO: inserta 2 juegos con ratings
-- Reemplaza <tu-user-id> con tu ID de auth.users (Profiles)
WITH g1 AS (
  SELECT id FROM games WHERE title = 'Hades' LIMIT 1
),
g2 AS (
  SELECT id FROM games WHERE title = 'Stardew Valley' LIMIT 1
)
INSERT INTO game_entries (id, game_id, user_id, platform_id, status, personal_rating, is_public, created_at, updated_at)
VALUES
  -- 3 ratings para Hades (todos 10/10 → debería liderar)
  ('test-hades-1', (SELECT id FROM g1), '<tu-user-id>', 6, 'completed', 10, true, NOW(), NOW()),
  ('test-hades-2', (SELECT id FROM g1), '<otro-user-id>', 6, 'completed', 10, true, NOW(), NOW()),
  ('test-hades-3', (SELECT id FROM g1), '<otro-user-id-2>', 6, 'completed', 9, true, NOW(), NOW()),
  -- 3 ratings para Stardew (8.7 promedio)
  ('test-sv-1', (SELECT id FROM g2), '<tu-user-id>', 6, 'completed', 9, true, NOW(), NOW()),
  ('test-sv-2', (SELECT id FROM g2), '<otro-user-id>', 6, 'completed', 9, true, NOW(), NOW()),
  ('test-sv-3', (SELECT id FROM g2), '<otro-user-id-2>', 6, 'completed', 8, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

Esperado: "Success. 6 rows inserted" (o similar).

- [ ] **Step 4: Re-verificar el ranking**

```sql
SELECT rank, title, avg_rating, rating_count FROM community_ranking ORDER BY rank;
```

Esperado: Hades primero (avg 9.7), Stardew segundo (avg 8.7).

- [ ] **Step 5: Limpiar datos de prueba**

```sql
DELETE FROM game_entries WHERE id LIKE 'test-%';
```

Esperado: "Success. 6 rows deleted".

- [ ] **Step 6: Documentar en el spec que la migration fue aplicada**

Agregar al final de `docs/superpowers/specs/20260607-top-community-ranking-design.md` (sección 8, Criterios de aceptación):

```markdown
- [x] Migration `20260607000000_community_ranking.sql` aplicada en Supabase (fecha: <YYYY-MM-DD>)
```

---

## Task 3: Crear Edge Function `weekly-snapshot`

**Files:**
- Create: `supabase/functions/weekly-snapshot/index.ts`
- Create: `supabase/functions/weekly-snapshot/deno.json`

- [ ] **Step 1: Crear el archivo `deno.json`**

```bash
mkdir -p supabase/functions/weekly-snapshot
```

Escribir en `supabase/functions/weekly-snapshot/deno.json`:

```json
{
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2"
  }
}
```

- [ ] **Step 2: Crear el archivo `index.ts`**

Escribir en `supabase/functions/weekly-snapshot/index.ts`:

```ts
// @ts-nocheck
// Edge Function — runs on Deno runtime.
// Triggered weekly by pg_cron. Snapshots the top 100 of community_ranking
// into community_rank_snapshots, keyed by week_start (lunes de la semana actual).

import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  // Validate shared secret (sent by pg_cron via Authorization header).
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
    // 1. Calculate week_start = lunes de esta semana, formato YYYY-MM-DD
    const now = new Date();
    const day = now.getUTCDay(); // 0 = dom, 1 = lun
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setUTCDate(monday.getUTCDate() + diff);
    const weekStart = monday.toISOString().split("T")[0];

    // 2. Read top 100 of community_ranking
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

    // 3. Upsert into community_rank_snapshots
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
```

- [ ] **Step 3: Configurar el secret `CRON_SECRET` en Supabase**

```bash
# Generar un secret seguro
openssl rand -hex 32
```

Copiar el valor generado. Luego, en Supabase Dashboard:
1. Project Settings → Edge Functions → Secrets
2. Add secret: `CRON_SECRET` = `<el valor generado>`

O vía CLI:
```bash
supabase secrets set CRON_SECRET=<el valor generado>
```

Esperado: el secret aparece en el dashboard / CLI response.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/weekly-snapshot/
git commit -m "feat(edge): add weekly-snapshot function for community rank snapshots"
```

---

## Task 4: Desplegar y probar la Edge Function

**Files:** (sin cambios, solo deployment)

- [ ] **Step 1: Desplegar la función**

```bash
supabase functions deploy weekly-snapshot --no-verify-jwt
```

Esperado: "Deployed Function weekly-snapshot" o similar.

- [ ] **Step 2: Probar con secret INCORRECTO (debe fallar)**

```bash
SUPABASE_URL="https://<tu-proyecto>.supabase.co"
curl -X POST "$SUPABASE_URL/functions/v1/weekly-snapshot" \
  -H "Authorization: Bearer wrong-secret" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Esperado: status `401`, body `{"error":"Unauthorized"}`.

- [ ] **Step 3: Probar con secret CORRECTO (debe succeed)**

```bash
SECRET="<el valor generado en Task 3>"
curl -X POST "$SUPABASE_URL/functions/v1/weekly-snapshot" \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Esperado: status `200`, body `{"ok":true,"week_start":"<YYYY-MM-DD>","inserted":0}` (o el número de filas si había datos de prueba).

- [ ] **Step 4: Verificar que la función insertó filas (si había datos)**

En el SQL editor:

```sql
SELECT * FROM community_rank_snapshots ORDER BY rank LIMIT 10;
```

Esperado: 0 filas (si limpiaste los datos de prueba en Task 2) o N filas con el `week_start` correcto.

---

## Task 5: Crear migration para pg_cron

**Files:**
- Create: `supabase/migrations/20260607000001_schedule_weekly_snapshot.sql`

- [ ] **Step 1: Crear el archivo de migration**

```bash
# Verificar que la extension pg_cron está habilitada
psql "$DATABASE_URL" -c "SELECT * FROM pg_available_extensions WHERE name = 'pg_cron';" 2>&1 || true
```

Si la extension no está habilitada, habilitarla en el dashboard de Supabase:
1. Database → Extensions → buscar "pg_cron" → Enable.

Escribir en `supabase/migrations/20260607000001_schedule_weekly_snapshot.sql`:

```sql
-- =========================================================
-- Programar el snapshot semanal de community_ranking
-- =========================================================
-- Esta migration NO funciona localmente; solo en Supabase,
-- donde la extension pg_cron está habilitada y se puede hacer
-- net.http_post a la Edge Function.

-- El CRON_SECRET se lee de la config de la database (configurada
-- en el dashboard de Supabase: Settings → Database → Custom config).
-- Si no está configurada, este bloque falla con un error claro.

DO $$
DECLARE
  cron_secret TEXT;
  supabase_url TEXT;
BEGIN
  -- Leer el secret configurado a nivel de database
  BEGIN
    cron_secret := current_setting('app.cron_secret', true);
  EXCEPTION WHEN OTHERS THEN
    cron_secret := NULL;
  END;

  -- URL del proyecto (Supabase expone project_url automáticamente)
  supabase_url := current_setting('app.supabase_url', true);

  IF cron_secret IS NULL OR supabase_url IS NULL THEN
    RAISE NOTICE 'pg_cron schedule NOT created: app.cron_secret and app.supabase_url must be set in Database settings';
  ELSE
    PERFORM cron.schedule(
      'weekly-community-snapshot',
      '0 0 * * 1',  -- lunes 00:00 UTC
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
```

- [ ] **Step 2: Configurar los settings de database (manual, una sola vez)**

En el dashboard de Supabase:
1. Settings → Database → "Custom Postgres Config" o "DB Settings"
2. O vía SQL:
   ```sql
   ALTER DATABASE postgres SET app.cron_secret = '<el mismo secret de Task 3>';
   ALTER DATABASE postgres SET app.supabase_url = 'https://<tu-proyecto>.supabase.co';
   ```

- [ ] **Step 3: Aplicar la migration**

```bash
supabase db push --include-all
```

O pegar el contenido en el SQL editor y "Run".

Esperado: NOTICE `pg_cron schedule NOT created...` (si no configuraste los settings) o sin output (si los configuraste).

- [ ] **Step 4: Verificar que el cron está registrado**

```sql
SELECT * FROM cron.job WHERE jobname = 'weekly-community-snapshot';
```

Esperado: 1 fila con `schedule = '0 0 * * 1'`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260607000001_schedule_weekly_snapshot.sql
git commit -m "feat(db): schedule weekly community snapshot via pg_cron"
```

---

## Task 6: Crear helper `src/utils/week.ts`

**Files:**
- Create: `src/utils/week.ts`

- [ ] **Step 1: Crear el archivo**

```bash
mkdir -p src/utils
```

Escribir en `src/utils/week.ts`:

```ts
/**
 * Devuelve la fecha (YYYY-MM-DD) del lunes de la semana UTC de la fecha dada.
 *
 * Se usa para alinear el cliente con la Edge Function `weekly-snapshot`,
 * que persiste snapshots con `date_trunc('week', now())::date` (lunes UTC).
 *
 * Comportamiento:
 *   - Domingo 2026-06-08 → lunes 2026-06-02
 *   - Lunes 2026-06-09 → lunes 2026-06-09
 *   - Miércoles 2026-06-11 → lunes 2026-06-09
 */
export function getWeekStartISO(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0 = domingo, 1 = lunes, ...
  const diff = day === 0 ? -6 : 1 - day; // distancia al lunes más cercano (anterior o igual)
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split("T")[0];
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0, sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/utils/week.ts
git commit -m "feat(utils): add getWeekStartISO helper for community ranking"
```

---

## Task 7: Crear hook `useCommunityRanking`

**Files:**
- Create: `src/features/top/useCommunityRanking.ts`

- [ ] **Step 1: Crear el archivo**

```bash
mkdir -p src/features/top
```

Escribir en `src/features/top/useCommunityRanking.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { getWeekStartISO } from "../../utils/week";

export type CommunityRankingRow = {
  igdb_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
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
      // 1. Ranking actual (top 100)
      const { data: current, error: e1 } = await supabase
        .from("community_ranking")
        .select(
          "igdb_id, title, cover_url, release_year, avg_rating, rating_count, rank",
        )
        .order("rank", { ascending: true })
        .limit(100);

      if (e1) throw e1;
      if (!current) return [];

      // 2. Snapshot de la semana pasada
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

      // 3. Merge
      return current.map((row) => {
        const previousRank = prevMap.get(row.igdb_id) ?? null;
        const change =
          previousRank !== null ? previousRank - row.rank : null;
        return { ...row, previousRank, change };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/top/useCommunityRanking.ts
git commit -m "feat(top): add useCommunityRanking hook"
```

---

## Task 8: Crear hook `useCommunityGameDetail`

**Files:**
- Create: `src/features/top/useCommunityGameDetail.ts`

- [ ] **Step 1: Crear el archivo**

Escribir en `src/features/top/useCommunityGameDetail.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { getWeekStartISO } from "../../utils/week";

export type CommunityReview = {
  game_id: string;
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
    id: string;
    title: string;
    cover_url: string | null;
    release_year: number | null;
  } | null;
  ranking: {
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
      // 1. Get game metadata by igdb_id
      const { data: game, error: gErr } = await supabase
        .from("games")
        .select("id, title, cover_url, release_year")
        .eq("igdb_id", igdbId)
        .single();

      if (gErr || !game) return null;

      // 2. Get ranking row for this igdb_id
      const { data: ranking, error: rErr } = await supabase
        .from("community_ranking")
        .select("avg_rating, rating_count, rank")
        .eq("igdb_id", igdbId)
        .single();

      if (rErr && rErr.code !== "PGRST116") throw rErr;

      // 3. Get reviews
      const { data: reviews, error: revErr } = await supabase
        .from("community_reviews")
        .select(
          "game_id, personal_rating, notes, updated_at, user_id, username, display_name, avatar_url",
        )
        .eq("game_id", game.id)
        .order("updated_at", { ascending: false });

      if (revErr) throw revErr;

      // 4. Get previous week rank
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
        previousRank !== null && ranking
          ? previousRank - ranking.rank
          : null;

      return {
        game,
        ranking: ranking ?? null,
        reviews: (reviews ?? []) as CommunityReview[],
        previousRank,
        change,
      };
    },
    enabled: Number.isFinite(igdbId) && igdbId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/top/useCommunityGameDetail.ts
git commit -m "feat(top): add useCommunityGameDetail hook"
```

---

## Task 9: Crear componente `RankBadge`

**Files:**
- Create: `src/features/top/RankBadge.tsx`

- [ ] **Step 1: Crear el archivo**

Escribir en `src/features/top/RankBadge.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { fontFamily, fontSize } from "../../constants/typography";

type Props = {
  change: number | null; // null = sin rank previo (juego nuevo)
  size?: "sm" | "md";
};

export function RankBadge({ change, size = "md" }: Props) {
  const isNew = change === null;
  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;
  const isSame = change !== null && change === 0;

  const color = isUp
    ? colors.success
    : isDown
      ? colors.danger
      : colors.foregroundMuted;

  const iconName: React.ComponentProps<typeof Ionicons>["name"] = isUp
    ? "arrow-up"
    : isDown
      ? "arrow-down"
      : "remove";

  const label = isNew
    ? "NEW"
    : isSame
      ? "—"
      : `${Math.abs(change ?? 0)}`;

  const fontSizeValue = size === "sm" ? fontSize.xxs : fontSize.xs;
  const padding = size === "sm" ? 4 : 6;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + "22", paddingHorizontal: padding },
      ]}
    >
      {!isNew && !isSame && (
        <Ionicons
          name={iconName}
          size={size === "sm" ? 10 : 12}
          color={color}
        />
      )}
      <Text style={[styles.text, { color, fontSize: fontSizeValue }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
});
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/top/RankBadge.tsx
git commit -m "feat(top): add RankBadge component"
```

---

## Task 10: Crear componente `RankingListItem`

**Files:**
- Create: `src/features/top/RankingListItem.tsx`

- [ ] **Step 1: Crear el archivo**

Escribir en `src/features/top/RankingListItem.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { fontFamily, fontSize } from "../../constants/typography";
import type { CommunityRankingRow } from "./useCommunityRanking";
import { RankBadge } from "./RankBadge";

type Props = {
  row: CommunityRankingRow;
  onPress: (igdbId: number) => void;
};

export function RankingListItem({ row, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => onPress(row.igdb_id)}
    >
      <Text style={styles.rank}>#{row.rank}</Text>

      {row.cover_url ? (
        <Image
          source={{ uri: row.cover_url }}
          style={styles.cover}
          contentFit="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons
            name="game-controller-outline"
            size={20}
            color={colors.foregroundMuted}
          />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {row.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="star" size={12} color={colors.rating} />
          <Text style={styles.rating}>
            {row.avg_rating.toFixed(1)}
          </Text>
          <Text style={styles.count}>({row.rating_count})</Text>
          {row.release_year && (
            <Text style={styles.year}>· {row.release_year}</Text>
          )}
        </View>
      </View>

      <RankBadge change={row.change} size="sm" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rank: {
    width: 36,
    color: colors.foregroundMuted,
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize.base,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  cover: {
    width: 44,
    height: 60,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    width: 44,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.foreground,
    fontSize: fontSize.md,
    fontFamily: fontFamily.sansSemibold,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    color: colors.rating,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  count: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.mono,
    fontVariant: ["tabular-nums"],
  },
  year: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.mono,
    fontVariant: ["tabular-nums"],
  },
});
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/top/RankingListItem.tsx
git commit -m "feat(top): add RankingListItem component"
```

---

## Task 11: Crear pantalla `app/(tabs)/top.tsx`

**Files:**
- Create: `app/(tabs)/top.tsx`

- [ ] **Step 1: Crear el archivo**

Escribir en `app/(tabs)/top.tsx`:

```tsx
import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, spacing } from "../../src/constants/theme";
import { fontFamily, fontSize } from "../../src/constants/typography";
import {
  useCommunityRanking,
  type CommunityRankingRow,
} from "../../src/features/top/useCommunityRanking";
import { RankingListItem } from "../../src/features/top/RankingListItem";

export default function TopScreen() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useCommunityRanking();

  const handlePress = useCallback((igdbId: number) => {
    router.push(`/community/game/${igdbId}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CommunityRankingRow }) => (
      <RankingListItem row={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color={colors.foregroundMuted}
        />
        <Text style={styles.errorTitle}>Sin conexión</Text>
        <Text style={styles.errorSub}>
          El ranking requiere internet. Revisa tu conexión e intenta de nuevo.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lo mejor de la comunidad</Text>
        <Text style={styles.subtitle}>
          Juegos con 3+ calificaciones públicas
        </Text>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.igdb_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="trophy-outline"
              size={48}
              color={colors.foregroundMuted}
            />
            <Text style={styles.emptyTitle}>
              Aún no hay ranking disponible
            </Text>
            <Text style={styles.emptySub}>
              Necesitamos al menos 3 calificaciones públicas para un juego.
              ¡Sé el primero en calificar uno!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.foreground,
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize["3xl"],
  },
  subtitle: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
    textAlign: "center",
  },
  emptySub: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  errorTitle: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
  },
  errorSub: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/top.tsx
git commit -m "feat(top): add Top ranking tab screen"
```

---

## Task 12: Crear pantalla `app/community/game/[igdbId].tsx`

**Files:**
- Create: `app/community/game/[igdbId].tsx`

- [ ] **Step 1: Crear el archivo**

```bash
mkdir -p app/community/game
```

Escribir en `app/community/game/[igdbId].tsx`:

```tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../../src/constants/theme";
import { fontFamily, fontSize } from "../../../src/constants/typography";
import {
  useCommunityGameDetail,
  type CommunityReview,
} from "../../../src/features/top/useCommunityGameDetail";
import { RankBadge } from "../../../src/features/top/RankBadge";
import { Avatar } from "../../../src/components/Avatar";

type SortMode = "recent" | "highest";

function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return `hace ${Math.floor(days / 365)} años`;
}

export default function CommunityGameScreen() {
  const { igdbId } = useLocalSearchParams<{ igdbId: string }>();
  const router = useRouter();
  const id = Number(igdbId);
  const { data, isLoading, isError, refetch, isRefetching } =
    useCommunityGameDetail(id);

  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const sortedReviews = useMemo(() => {
    if (!data?.reviews) return [];
    const list = [...data.reviews];
    if (sortMode === "recent") {
      list.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    } else {
      list.sort((a, b) => b.personal_rating - a.personal_rating);
    }
    return list;
  }, [data?.reviews, sortMode]);

  const renderReview = useCallback(
    ({ item }: { item: CommunityReview }) => (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <TouchableOpacity
            style={styles.reviewUser}
            activeOpacity={0.7}
            onPress={() => router.push(`/profile/${item.username}`)}
          >
            <Avatar
              avatarUrl={item.avatar_url}
              username={item.username}
              displayName={item.display_name}
              size={36}
            />
            <View>
              <Text style={styles.reviewUsername}>@{item.username}</Text>
              {item.display_name && (
                <Text style={styles.reviewDisplayName}>
                  {item.display_name}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.reviewRating}>
            <Ionicons name="star" size={14} color={colors.rating} />
            <Text style={styles.reviewRatingText}>
              {item.personal_rating}
            </Text>
          </View>
        </View>
        <Text style={styles.reviewNotes}>{item.notes}</Text>
        <Text style={styles.reviewDate}>
          {formatRelativeDate(item.updated_at)}
        </Text>
      </View>
    ),
    [router],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !data || !data.game) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.foregroundMuted}
        />
        <Text style={styles.errorTitle}>No se pudo cargar el juego</Text>
      </View>
    );
  }

  const { game, ranking, change } = data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={undefined}
    >
      <Stack.Screen options={{ title: game.title }} />

      {/* HEADER */}
      <View style={styles.headerCard}>
        <View style={styles.heroRow}>
          {game.cover_url ? (
            <Image
              source={{ uri: game.cover_url }}
              style={styles.cover}
              contentFit="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons
                name="game-controller-outline"
                size={32}
                color={colors.foregroundMuted}
              />
            </View>
          )}
          <View style={styles.heroInfo}>
            <Text style={styles.title} numberOfLines={3}>
              {game.title}
            </Text>
            {game.release_year && (
              <Text style={styles.year}>{game.release_year}</Text>
            )}
            {ranking && (
              <View style={styles.statsRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={18} color={colors.rating} />
                  <Text style={styles.ratingText}>
                    {ranking.avg_rating.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.ratingCount}>
                  ({ranking.rating_count} calificaciones)
                </Text>
              </View>
            )}
          </View>
        </View>

        {ranking && (
          <View style={styles.rankRow}>
            <Text style={styles.rankLabel}>Rank actual</Text>
            <Text style={styles.rankNumber}>#{ranking.rank}</Text>
            <RankBadge change={change} />
          </View>
        )}
      </View>

      {/* SORT TOGGLE */}
      {sortedReviews.length > 0 && (
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortMode === "recent" && styles.sortBtnActive,
            ]}
            onPress={() => setSortMode("recent")}
          >
            <Text
              style={[
                styles.sortText,
                sortMode === "recent" && styles.sortTextActive,
              ]}
            >
              Más recientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortMode === "highest" && styles.sortBtnActive,
            ]}
            onPress={() => setSortMode("highest")}
          >
            <Text
              style={[
                styles.sortText,
                sortMode === "highest" && styles.sortTextActive,
              ]}
            >
              Mejor valoradas
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REVIEWS LIST */}
      {sortedReviews.length > 0 ? (
        sortedReviews.map((review) => (
          <View key={`${review.user_id}-${review.updated_at}`}>
            {renderReview({ item: review })}
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Ionicons
            name="chatbubbles-outline"
            size={40}
            color={colors.foregroundMuted}
          />
          <Text style={styles.emptyTitle}>Aún no hay reviews con notas</Text>
          <Text style={styles.emptySub}>
            Sé el primero en compartir tu opinión sobre este juego.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl * 2,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
  },
  headerCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  heroRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cover: {
    width: 90,
    height: 130,
    borderRadius: radius.md,
  },
  coverPlaceholder: {
    width: 90,
    height: 130,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.foreground,
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize["2xl"],
  },
  year: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.rating + "22",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  ratingText: {
    color: colors.rating,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  ratingCount: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xs,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rankLabel: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rankNumber: {
    color: colors.foreground,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  sortRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sortBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtnActive: {
    backgroundColor: colors.primary + "22",
    borderColor: colors.primary,
  },
  sortText: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sansSemibold,
  },
  sortTextActive: {
    color: colors.primary,
  },
  reviewCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  reviewUsername: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sansSemibold,
  },
  reviewDisplayName: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xxs,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingText: {
    color: colors.rating,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  reviewNotes: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  reviewDate: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xxs,
    fontFamily: fontFamily.mono,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
    textAlign: "center",
  },
  emptySub: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add app/community/game/\[igdbId\].tsx
git commit -m "feat(community): add community game detail screen"
```

---

## Task 13: Modificar `app/(tabs)/_layout.tsx` para agregar la tab "Top"

**Files:**
- Modify: `app/(tabs)/_layout.tsx` (línea 16-21)

- [ ] **Step 1: Agregar la entrada "Top" al array `TAB_ROUTES`**

Localizar el array `TAB_ROUTES` (línea 16-21) y agregar la nueva entrada al final:

```ts
const TAB_ROUTES: { name: string; title: string; icon: IoniconsName }[] = [
  { name: "index", title: "Backlog", icon: "game-controller" },
  { name: "discover", title: "Discover", icon: "search" },
  { name: "friends", title: "Friends", icon: "people" },
  { name: "stats", title: "Stats", icon: "bar-chart" },
  { name: "top", title: "Top", icon: "podium" },
];
```

- [ ] **Step 2: Verificar que el `TabletLayout` también renderiza la tab**

El `TabletLayout` itera sobre `TAB_ROUTES` y renderiza un `Tabs.Screen` por cada uno. Localizar el bloque:

```tsx
<Tabs
  screenOptions={{
    headerShown: false,
    tabBarStyle: {
      display: "none",
    },
  }}
>
  <Tabs.Screen name="index" />
  <Tabs.Screen name="discover" />
  <Tabs.Screen name="friends" />
  <Tabs.Screen name="stats" />
</Tabs>
```

Agregar `<Tabs.Screen name="top" />` después de "stats":

```tsx
<Tabs
  screenOptions={{
    headerShown: false,
    tabBarStyle: {
      display: "none",
    },
  }}
>
  <Tabs.Screen name="index" />
  <Tabs.Screen name="discover" />
  <Tabs.Screen name="friends" />
  <Tabs.Screen name="stats" />
  <Tabs.Screen name="top" />
</Tabs>
```

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "feat(tabs): add Top tab to bottom navigation"
```

---

## Task 14: Actualizar `.env.example`

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Agregar documentación del `CRON_SECRET`**

Leer primero el contenido actual de `.env.example` y agregar al final:

```bash
cat .env.example
```

Si el archivo ya tiene variables, agregar al final (preservando el formato existente):

```env

# Supabase Edge Function: weekly-snapshot
# Used by pg_cron to authenticate the weekly cron call to the Edge Function.
# Generate a new one with: openssl rand -hex 32
# Must match the value configured in Supabase Dashboard → Edge Function secrets.
CRON_SECRET=
```

- [ ] **Step 2: Verificar que `.env` (gitignored) NO se commitea**

```bash
git status --short .env .env.example
```

Esperado: solo `.env.example` aparece como modificado. Si `.env` aparece, NO commitearlo (es un gitignore issue existente, no de esta feature).

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs(env): document CRON_SECRET for weekly-snapshot function"
```

---

## Task 15: Disparar snapshot inicial y verificar end-to-end

**Files:** (sin cambios, solo deployment + verificación)

- [ ] **Step 1: Insertar datos de prueba temporales para tener algo que rankear**

En el SQL editor de Supabase, ejecutar el script de Task 2 Step 3 (insertar 2 juegos con 3 ratings cada uno). Ajustar los `<user-ids>` con IDs reales de tu tabla `auth.users`.

- [ ] **Step 2: Verificar el ranking actual**

```sql
SELECT rank, title, avg_rating, rating_count FROM community_ranking ORDER BY rank;
```

Esperado: 2 filas (Hades y Stardew, en el orden que tengan por rating).

- [ ] **Step 3: Disparar la Edge Function manualmente con el secret correcto**

```bash
SECRET="<tu CRON_SECRET>"
curl -X POST "https://<tu-proyecto>.supabase.co/functions/v1/weekly-snapshot" \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Esperado: `{"ok":true,"week_start":"<YYYY-MM-DD>","inserted":2}`.

- [ ] **Step 4: Verificar el snapshot en la tabla**

```sql
SELECT * FROM community_rank_snapshots ORDER BY rank;
```

Esperado: 2 filas con el `week_start` de este lunes y los ranks correctos.

- [ ] **Step 5: Cambiar los ratings para alterar el ranking**

```sql
-- Swap ratings: ahora Stardew lidera con 10/10
UPDATE game_entries SET personal_rating = 10 WHERE id = 'test-sv-1';
UPDATE game_entries SET personal_rating = 10 WHERE id = 'test-sv-2';
UPDATE game_entries SET personal_rating = 10 WHERE id = 'test-sv-3';
UPDATE game_entries SET personal_rating = 8  WHERE id = 'test-hades-1';
UPDATE game_entries SET personal_rating = 8  WHERE id = 'test-hades-2';
UPDATE game_entries SET personal_rating = 8  WHERE id = 'test-hades-3';
```

- [ ] **Step 6: Iniciar la app y verificar la tab "Top"**

```bash
npx expo start
```

- Abrir la app en iOS o Android.
- Verificar:
  - La tab "Top" aparece en la barra inferior (con icono de podium).
  - Al tocarla, muestra el ranking con Stardew arriba y Hades abajo.
  - El badge muestra `NEW` (porque el snapshot es de esta misma semana, mismo rank anterior).
  - Al tocar un juego, abre el detalle con el header y la lista de reviews.

- [ ] **Step 7: Disparar el snapshot de nuevo y verificar el cambio**

Volver a ejecutar el `curl` del Step 3. La tabla `community_rank_snapshots` se actualiza con los nuevos ranks (mismo `week_start` porque es la misma semana, `ON CONFLICT DO UPDATE`).

- [ ] **Step 8: Limpiar datos de prueba**

```sql
DELETE FROM game_entries WHERE id LIKE 'test-%';
DELETE FROM community_rank_snapshots WHERE week_start >= '2026-06-01';
```

- [ ] **Step 9: Verificar que el cron está registrado correctamente**

```sql
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'weekly-community-snapshot';
```

Esperado: `active = true`, `schedule = '0 0 * * 1'`.

---

## Task 16: Verificación final y commit de cierre

**Files:** (sin cambios si todo pasó)

- [ ] **Step 1: TypeScript check global**

```bash
npx tsc --noEmit
```

Esperado: exit code 0.

- [ ] **Step 2: Verificar el diff final**

```bash
git status --short
git log --oneline -20
```

Esperado: solo los commits de las tareas 1-14. Si `app/community/game/[igdbId].tsx` quedó con `FlatList` sin usar, ajustar el import.

- [ ] **Step 3: Verificar que la spec está marcada como completada**

En `docs/superpowers/specs/20260607-top-community-ranking-design.md`, sección 8 (Criterios de aceptación), verificar que todos los items están marcados con `- [x]` (excepto los opcionales o de post-MVP).

- [ ] **Step 4: Actualizar `CHANGELOG.md`**

Agregar al inicio del archivo `CHANGELOG.md`:

```markdown
## [Unreleased]

### Added
- New "Top" tab with community game ranking
- Weekly rank change indicator (up/down/new)
- Community game detail screen with public reviews
```

(Si el CHANGELOG.md sigue un formato diferente, adaptarse a él.)

- [ ] **Step 5: Commit final**

```bash
git add CHANGELOG.md
git commit -m "docs: add Top community ranking to unreleased changelog"
```

- [ ] **Step 6: Push a la rama y abrir PR (opcional, solo si el usuario lo pide)**

```bash
git push -u origin comunity
gh pr create --title "feat: Top community ranking" --body "Implements the Top tab with community rankings, weekly rank change indicators, and a detail screen showing public reviews. See docs/superpowers/specs/20260607-top-community-ranking-design.md for the design."
```

---

## Resumen de archivos

| Tarea | Archivo | Acción |
|-------|---------|--------|
| 1 | `supabase/migrations/20260607000000_community_ranking.sql` | Crear |
| 3 | `supabase/functions/weekly-snapshot/index.ts` | Crear |
| 3 | `supabase/functions/weekly-snapshot/deno.json` | Crear |
| 5 | `supabase/migrations/20260607000001_schedule_weekly_snapshot.sql` | Crear |
| 6 | `src/utils/week.ts` | Crear |
| 7 | `src/features/top/useCommunityRanking.ts` | Crear |
| 8 | `src/features/top/useCommunityGameDetail.ts` | Crear |
| 9 | `src/features/top/RankBadge.tsx` | Crear |
| 10 | `src/features/top/RankingListItem.tsx` | Crear |
| 11 | `app/(tabs)/top.tsx` | Crear |
| 12 | `app/community/game/[igdbId].tsx` | Crear |
| 13 | `app/(tabs)/_layout.tsx` | Modificar |
| 14 | `.env.example` | Modificar |
| 16 | `CHANGELOG.md` | Modificar |
