# Agent Guidance for Playlogged

## Project Type
Expo SDK 55 (React Native 0.83.6) + TypeScript + Expo Router (file-based routing)

## Developer Commands

| Command | Description |
|---------|-------------|
| `npx expo start` | Start dev server |
| `npx expo start --web` | Run web version |
| `npx expo run:android` | Build and run Android |
| `npx expo run:ios` | Build and run iOS |

TypeScript check: `npx tsc --noEmit`

## Architecture

- **Routing**: `app/` directory uses Expo Router file-based routing
  - `app/(tabs)/` → bottom tab screens (home, discover, stats, friends)
  - `app/auth/` → login/register
  - `app/game/[id].tsx` → game detail
  - `app/profile/[username].tsx` → public profile
- **State**: Zustand for UI state (`src/store/`), TanStack Query for server state
- **Local DB**: Expo SQLite (`src/db/`)
- **Auth**: Supabase Auth with session in `src/lib/supabase.ts`

## Key Files

- `src/lib/supabase.ts` — Supabase client initialization
- `src/lib/sync.ts` — Cloud sync logic
- `src/db/schema.ts` — SQLite schema
- `src/api/igdb.client.ts` — IGDB API calls via proxy

## Environment Variables

Required in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_IGDB_PROXY_URL` (Vercel-deployed proxy for IGDB)

App works offline without Supabase (local-only mode).

## Build & Deploy

- **EAS Build**: `eas build --profile <development|preview|staging|production> --platform <android|ios>`
- **Android**: `eas build --profile development --platform android` (development client)
- **iOS**: Uses local Xcode for development, EAS for production

## Gotchas

1. **No lint/test scripts** — Project has no ESLint, Prettier, or test suite configured
2. **IGDB via proxy** — Cannot call IGDB directly; requires Vercel serverless proxy (deploy from `/proxy` or external)
3. **Supabase Edge Function** — `supabase/functions/delete-account/` exists but is optional
4. **No proxy in repo** — IGDB proxy must be deployed separately to Vercel
5. **Fonts loaded at runtime** — `src/constants/useAppFonts.ts` handles font loading; check if fonts fail to render