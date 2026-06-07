# Top — Ranking de la comunidad

> Spec para agregar la feature "Top" a Playlogged: un ranking global de juegos basado en las calificaciones de la comunidad, con indicador de cambio de posición semanal y vista detallada de reviews públicas.

**Fecha:** 2026-06-07
**Estado:** Aprobado en brainstorm
**Stack:** Expo SDK 55 + Supabase (existente)

---

## 1. Resumen

Una nueva tab **"Top"** en la barra inferior que muestra los 100 juegos mejor calificados por la comunidad global de Playlogged. Cada juego muestra su rating promedio, cantidad de calificaciones y un indicador visual de si subió, bajó o se mantuvo en su posición comparada con la semana anterior.

Al tocar un juego del ranking, se abre una pantalla de detalle con el rating promedio, el rank actual, el cambio semanal y una lista de reviews públicas (avatar, @username, rating, fecha, nota).

Los datos ya existen en Supabase (`game_entries` con `is_public = true` y `personal_rating` no nulo) — la feature agrega agregación, persistencia de snapshots y dos pantallas nuevas.

---

## 2. Decisiones de diseño (de brainstorm)

| Pregunta | Decisión |
|----------|----------|
| ¿Quién aparece en el ranking? | Todos los usuarios públicos de Playlogged |
| ¿Cómo se calcula el cambio de posición? | Snapshot semanal automático (pg_cron + Edge Function) |
| ¿Mínimo de ratings para aparecer? | 3 calificaciones |
| ¿Dónde va la pantalla? | Nueva tab "Top" en la barra inferior (5ta tab) |
| ¿Qué muestra la vista de notas? | Header con stats + lista de reviews ordenable |
| ¿Nombre de la tab? | "Top" |
| ¿Cálculo en cliente o Supabase? | En Supabase (vista + tabla) |

---

## 3. Arquitectura

```
┌─────────────────────┐         ┌──────────────────────────────────────┐
│  App (Expo/RN)      │         │  Supabase                            │
│                     │         │                                      │
│  - Tab "Top"        │ ──GET──▶│  View: community_ranking             │
│    (top.tsx)        │         │  Table: community_rank_snapshots     │
│                     │         │  View: community_reviews             │
│  - Detalle juego    │ ──GET──▶│  pg_cron + Edge Function semanal     │
│    (community/      │         │  RLS existente en game_entries y     │
│     game/[igdbId])  │         │  profiles (sin cambios)              │
└─────────────────────┘         └──────────────────────────────────────┘
```

**Flujo de datos:**

1. **Ranking actual:** la app consulta la vista `community_ranking` (top 100 ordenado por `avg_rating` desc).
2. **Cambio de posición:** la app hace un JOIN con `community_rank_snapshots` buscando la fila del `igdb_id` con `week_start` de la semana anterior, y compara `rank`.
3. **Reviews:** la app consulta la vista `community_reviews` filtrando por `game_id`.
4. **Snapshot semanal:** pg_cron dispara la Edge Function `weekly-snapshot` cada lunes 00:00 UTC, que inserta el top 100 actual en `community_rank_snapshots` con `week_start = date_trunc('week', now())`.

---

## 4. Backend — Supabase

### 4.1 Nueva migration

Archivo: `supabase/migrations/20260607000000_community_ranking.sql`

```sql
-- =========================================================
-- Vista: ranking actual
-- =========================================================
CREATE OR REPLACE VIEW community_ranking AS
SELECT
  g.igdb_id,
  g.title,
  g.cover_url,
  g.release_year,
  ROUND(AVG(ge.personal_rating)::numeric, 1) AS avg_rating,
  COUNT(*) AS rating_count,
  RANK() OVER (ORDER BY AVG(ge.personal_rating) DESC, COUNT(*) DESC) AS rank
FROM games g
JOIN game_entries ge ON ge.game_id = g.id
WHERE ge.is_public = true
  AND ge.personal_rating IS NOT NULL
GROUP BY g.igdb_id, g.title, g.cover_url, g.release_year
HAVING COUNT(*) >= 3;

-- =========================================================
-- Tabla: snapshots semanales
-- =========================================================
CREATE TABLE community_rank_snapshots (
  igdb_id      INTEGER NOT NULL,
  week_start   DATE    NOT NULL,
  rank         INTEGER NOT NULL,
  avg_rating   NUMERIC(3,1) NOT NULL,
  rating_count INTEGER NOT NULL,
  PRIMARY KEY (igdb_id, week_start)
);

CREATE INDEX idx_snapshots_week ON community_rank_snapshots(week_start DESC);
CREATE INDEX idx_snapshots_igdb ON community_rank_snapshots(igdb_id);

-- =========================================================
-- RLS: lectura pública (el ranking es público por diseño)
-- =========================================================
ALTER TABLE community_rank_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read snapshots"
  ON community_rank_snapshots
  FOR SELECT
  USING (true);

-- Solo el sistema escribe (service_role) — no se crea policy de INSERT/UPDATE
-- para usuarios autenticados, así pg_cron con service_role key es el único
-- que puede escribir.

-- =========================================================
-- Vista: reviews públicas (notas + rating + perfil)
-- =========================================================
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

-- Grants explícitos (Supabase requiere esto para el cliente)
GRANT SELECT ON community_ranking  TO anon, authenticated;
GRANT SELECT ON community_reviews  TO anon, authenticated;
GRANT SELECT ON community_rank_snapshots TO anon, authenticated;
```

### 4.2 Edge Function: `weekly-snapshot`

Archivo: `supabase/functions/weekly-snapshot/index.ts`

**Responsabilidad:** tomar el top 100 de `community_ranking` y persistirlo en `community_rank_snapshots` con la semana actual.

**Pseudocódigo:**

```ts
// 1. Calcular week_start = date_trunc('week', now())::date (lunes)
// 2. Leer top 100 de community_ranking
// 3. Para cada fila: upsert en community_rank_snapshots
//    con ON CONFLICT (igdb_id, week_start) DO UPDATE
// 4. Log de filas insertadas/actualizadas
// 5. Return 200 con summary
```

**Trigger vía pg_cron:**

```sql
-- Se aplica manualmente en Supabase SQL editor
-- (o vía una migration adicional: 20260607000001_schedule_weekly_snapshot.sql)
SELECT cron.schedule(
  'weekly-community-snapshot',
  '0 0 * * 1',  -- lunes 00:00 UTC
  $$
  SELECT net.http_post(
    url     := '<SUPABASE_URL>/functions/v1/weekly-snapshot',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.cron_secret'),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  );
  $$
);
```

**Nota:** el `cron_secret` se configura una sola vez con `ALTER DATABASE postgres SET app.cron_secret = '...'`. La Edge Function valida que el header `Authorization` coincida antes de ejecutar.

### 4.3 Variables de entorno

Agregar a `.env` y a `.env.example` (referencia, no el valor):

```
CRON_SECRET=<long random string>
```

Y en Supabase Dashboard → Edge Function secrets: el mismo valor.

---

## 5. Frontend — React Native (Expo)

### 5.1 Nueva tab: `app/(tabs)/top.tsx`

**Comportamiento:**

- Carga la vista `community_ranking` con `LIMIT 100`.
- Hace un segundo query a `community_rank_snapshots` filtrando por `week_start = date_trunc('week', now() - interval '7 days')::date` para obtener los ranks anteriores.
- Mergea ambos resultados en el cliente: para cada juego actual, calcula `change = prev_rank - current_rank`. Si `prev_rank` no existe (juego nuevo), `change = null` → badge "NEW".
- Renderiza lista con `FlatList`:
  - Cada item: rank (#N), cover, título, año, `avg_rating ★` con `(N calificaciones)`, badge de cambio.
  - Colores del badge: verde `#22c55e` (subió), rojo `#ef4444` (bajó), gris `colors.foregroundMuted` (igual).
- Pull-to-refresh.
- Empty state: "Aún no hay juegos con 3+ calificaciones. ¡Sé el primero en calificar uno!"
- Tap en item → `router.push(\`/community/game/${item.igdb_id}\`)`.

**Hook:** `src/features/top/useCommunityRanking.ts`

```ts
export function useCommunityRanking() {
  return useQuery({
    queryKey: ["community-ranking"],
    queryFn: async () => {
      // 1. Get current ranking
      const { data: current, error: e1 } = await supabase
        .from("community_ranking")
        .select("*")
        .order("rank", { ascending: true })
        .limit(100);

      if (e1) throw e1;

      // 2. Get last week's snapshot
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const weekStart = new Date(lastWeek);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekStartISO = weekStart.toISOString().split("T")[0];

      const { data: prev, error: e2 } = await supabase
        .from("community_rank_snapshots")
        .select("igdb_id, rank")
        .eq("week_start", weekStartISO);

      if (e2) throw e2;

      const prevMap = new Map(prev?.map((p) => [p.igdb_id, p.rank]) ?? []);
      return current!.map((row) => ({
        ...row,
        previousRank: prevMap.get(row.igdb_id) ?? null,
        change: prevMap.has(row.igdb_id)
          ? prevMap.get(row.igdb_id)! - row.rank
          : null,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
```

### 5.2 Nueva ruta: `app/community/game/[igdbId].tsx`

**Comportamiento:**

- Recibe `igdbId` como param.
- Carga en paralelo:
  - Fila de `community_ranking` filtrando por `igdb_id` (header: rating, count, rank, change).
  - Filas de `community_reviews` filtrando por `game_id` (join manual: primero `games.igdb_id = X` → `games.id` → `community_reviews.game_id`).
  - Como la vista no expone `igdb_id` directamente, hay que resolverlo: query a `games(igdb_id)` para obtener `id`, luego query a `community_reviews(game_id)`.
- Render:
  - **Header:** cover grande, título, año, `X.X ★ (N calificaciones)`, `#N` con badge de cambio, plataforma más frecuente (opcional en v1, ver §6).
  - **Toggle de orden:** "Más recientes" / "Mejor valoradas".
  - **Lista de reviews:** cada item: avatar (componente `Avatar`), @username (linkable a `/profile/[username]`), rating en grande, fecha relativa ("hace 3 días"), nota completa.
  - **Empty state diferenciado:** "Aún no hay reviews con notas para este juego."

**Hook:** `src/features/top/useCommunityGameDetail.ts`

```ts
export function useCommunityGameDetail(igdbId: number) {
  return useQuery({
    queryKey: ["community-game", igdbId],
    queryFn: async () => {
      // 1. Get game metadata
      const { data: game } = await supabase
        .from("games")
        .select("id, title, cover_url, release_year")
        .eq("igdb_id", igdbId)
        .single();

      if (!game) return null;

      // 2. Get ranking row for this game
      const { data: ranking } = await supabase
        .from("community_ranking")
        .select("*")
        .eq("igdb_id", igdbId)
        .single();

      // 3. Get reviews
      const { data: reviews } = await supabase
        .from("community_reviews")
        .select("*")
        .eq("game_id", game.id)
        .order("updated_at", { ascending: false });

      // 4. Get previous week rank
      const weekStartISO = getLastWeekStartISO();
      const { data: prev } = await supabase
        .from("community_rank_snapshots")
        .select("rank")
        .eq("igdb_id", igdbId)
        .eq("week_start", weekStartISO)
        .single();

      return {
        game,
        ranking,
        reviews: reviews ?? [],
        previousRank: prev?.rank ?? null,
        change: prev ? prev.rank - (ranking?.rank ?? 0) : null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

### 5.3 Modificación: `app/(tabs)/_layout.tsx`

Agregar entrada al array `TAB_ROUTES`:

```ts
{ name: "top", title: "Top", icon: "podium" }
```

Posición: después de "stats" (queda: Backlog, Discover, Friends, Stats, Top).

El `TabletLayout` lee de `TAB_ROUTES` automáticamente y se actualiza solo.

### 5.4 Archivos a crear/resumir

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `supabase/migrations/20260607000000_community_ranking.sql` | Nuevo | Vista + tabla + RLS + grants |
| `supabase/functions/weekly-snapshot/index.ts` | Nuevo | Edge Function del snapshot |
| `supabase/functions/weekly-snapshot/deno.json` | Nuevo | Config Deno estándar |
| `app/(tabs)/top.tsx` | Nuevo | Pantalla de ranking |
| `app/community/game/[igdbId].tsx` | Nuevo | Pantalla de detalle |
| `src/features/top/useCommunityRanking.ts` | Nuevo | Hook TanStack Query |
| `src/features/top/useCommunityGameDetail.ts` | Nuevo | Hook TanStack Query |
| `src/features/top/RankBadge.tsx` | Nuevo | Componente badge ▲▼—NEW |
| `src/features/top/RankingListItem.tsx` | Nuevo | Componente item de la lista |
| `app/(tabs)/_layout.tsx` | Modificar | Agregar tab Top |
| `.env.example` | Modificar | Documentar `CRON_SECRET` |

---

## 6. Consideraciones

### 6.1 Performance

- La vista `community_ranking` se reevalúa en cada query. Con ~50K usuarios y 200K entradas públicas, sigue siendo rápido gracias a los índices existentes (`idx_entries_game_id`).
- Si pasa de 1M de filas, migrar a `MATERIALIZED VIEW` con refresh semanal.
- La app cachea con `staleTime: 5 min` para evitar requests innecesarios.

### 6.2 Privacidad

- La vista `community_reviews` solo expone notas con `is_public = true`. Las RLS existentes en `game_entries` (que el dueño controla) ya garantizan que notas privadas nunca se filtren.
- Los usernames/avatars mostrados son los mismos que ya se muestran en `/profile/[username]`. Si un usuario no quiere aparecer, pone su entrada como privada.
- El endpoint `/community/game/[igdbId]` no requiere auth — el ranking es público.

### 6.3 Datos no nuevos

No se agregan columnas a tablas existentes. Solo se crean:
- 1 tabla (`community_rank_snapshots`)
- 2 vistas (`community_ranking`, `community_reviews`)

Migración hacia atrás es trivial: `DROP VIEW` + `DROP TABLE`.

### 6.4 Compatibilidad con la app offline

- Las pantallas nuevas requieren conexión (leen de Supabase).
- Comportamiento guest (sin sesión): la app **sí** muestra el ranking y las reviews — son datos públicos. No requiere estar logueado.
- Si no hay red: empty state "Sin conexión — el ranking requiere internet" con botón de reintentar.

---

## 7. Fuera de scope (v1)

- Filtros por plataforma, género o año.
- Top semanal / mensual / yearly (solo all-time con cambio semanal).
- "Trending" o "Most played this month".
- CTA de "escribir tu review" desde la pantalla de comunidad (ya se hace desde `/game/[id]`).
- Notificaciones push de cambios de ranking.
- Caché local de reviews (siempre se lee de Supabase).
- Comentarios o respuestas a reviews.
- Sistema de "likes" o "útil" en reviews.

---

## 8. Criterios de aceptación

1. La tab "Top" aparece en la barra inferior (mobile) y en la sidebar (tablet) en la posición correcta.
2. El ranking muestra juegos con 3+ calificaciones, ordenados por rating promedio descendente.
3. Cada juego muestra un badge: verde con `▲ N` (subió), rojo con `▼ N` (bajó), gris con `—` (igual), gris con `NEW` (sin rank previo).
4. Al tocar un juego se navega a la pantalla de detalle con header (cover, rating, rank, cambio) y lista de reviews.
5. Las reviews son ordenables (más recientes / mejor valoradas).
6. El snapshot semanal se ejecuta vía pg_cron y se verifica que las filas se insertan en `community_rank_snapshots` con la `week_start` correcta.
7. La Edge Function `weekly-snapshot` rechaza requests sin el `CRON_SECRET` correcto.
8. Las notas privadas nunca aparecen en `community_reviews` (verificado con test que inserta `is_public = false`).
9. La app funciona sin sesión activa (ranking es público).
10. Sin conexión, se muestra el empty state de "Sin conexión" sin crashear.
11. El tipo de cambio es TypeScript-clean (`npx tsc --noEmit` pasa sin errores).

---

## 9. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Vista lenta con muchos datos | Índices + plan de migrar a MATERIALIZED VIEW documentado |
| Edge Function falla en el cron | Reintento automático de pg_cron; alert si falla 3 veces seguidas (post-MVP) |
| RLS expone algo privado | La vista solo lee de `is_public = true`; revisar el SQL antes de aplicar |
| Nombre de tab colisiona con otro componente | "Top" no se usa en el código actual (verificado) |
| 5ta tab se ve apretada en mobile | Patrón ya usado en 4 tabs; IOS y Android soportan 5 sin overflow |

---

## 10. Orden de implementación sugerido

1. Aplicar migration `20260607000000_community_ranking.sql` en Supabase.
2. Crear Edge Function `weekly-snapshot` y aplicar pg_cron.
3. Probar manualmente la Edge Function (ejecutarla una vez con el secret, verificar que la tabla se llena).
4. Crear hook `useCommunityRanking` y pantalla `app/(tabs)/top.tsx`.
5. Crear hook `useCommunityGameDetail` y pantalla `app/community/game/[igdbId].tsx`.
6. Crear componentes `RankBadge` y `RankingListItem`.
7. Modificar `app/(tabs)/_layout.tsx` para agregar la tab.
8. Verificar TypeScript (`npx tsc --noEmit`).
9. Probar flujo end-to-end en simulador iOS y Android.
10. (Opcional) Disparar el snapshot manualmente para tener datos desde el día 1.
