# Playlogged — Social Features v1.1 Planning Document

> Usa este documento como contexto al iniciar una nueva conversación con Claude.
> Pega este contenido completo y di: "Quiero continuar implementando las features sociales de Playlogged. Aquí está el contexto del proyecto."

---

## Proyecto

- **App:** Playlogged — game backlog tracker
- **Stack:** React Native + Expo SDK 55, TypeScript, Expo Router, Expo SQLite, Zustand, TanStack Query
- **IGDB Proxy:** https://gamelog-proxy.vercel.app/api/games
- **Tema:** Dark mode, color primario `#7c6af7`
- **Repo:** https://github.com/neryad/playlogged

---

## Estado actual de la app (v1.0.0)

- Publicada en Google Play
- Publicada en la app store
- Funciona 100% offline con SQLite local
- No tiene cuentas de usuario
- No tiene backend propio (solo proxy IGDB en Vercel)

### Estructura de carpetas actual

```
app/
├── _layout.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx          ← Backlog screen
│   ├── discover.tsx       ← Search screen
│   └── stats.tsx          ← Stats screen
└── game/
    └── [id].tsx           ← Game detail screen

src/
├── types/game.ts
├── constants/theme.ts, platforms.ts
├── db/
│   ├── schema.ts
│   └── queries/games.ts, stats.ts
├── api/
│   ├── igdb.client.ts
│   ├── igdb.mapper.ts
│   └── igdb.types.ts
├── store/ui.store.ts
├── features/
│   ├── backlog/useBacklog.ts
│   ├── game-detail/useGameDetail.ts
│   ├── search/useGameSearch.ts, AddGameSheet.tsx
│   ├── next-to-play/NextToPlayModal.tsx, pickNextGame.ts
│   └── about/AboutModal.tsx
├── components/
│   ├── GameCard.tsx
│   ├── FilterBar.tsx
│   └── SwipeableGameCard.tsx
└── hooks/useDebounce.ts
```

### Schema SQLite actual

```sql
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  igdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  cover_url TEXT,
  summary TEXT,
  release_year INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE TABLE IF NOT EXISTS game_entries (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  platform_id INTEGER,
  status TEXT NOT NULL DEFAULT 'backlog',
  hours_played REAL DEFAULT 0,
  personal_rating INTEGER,
  notes TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
```

### Tipos principales

```ts
export type GameStatus =
  | "backlog"
  | "playing"
  | "completed"
  | "dropped"
  | "wishlist";

export interface Game {
  id: string;
  igdbId?: number;
  title: string;
  coverUrl?: string;
  summary?: string;
  releaseYear?: number;
}

export interface GameEntry {
  id: string;
  gameId: string;
  platformId?: number;
  status: GameStatus;
  hoursPlayed: number;
  personalRating?: number;
  notes?: string;
  startedAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
  game?: Game;
}
```

---

## Feature Social — v1.1

### Objetivo

Permitir que usuarios se registren opcionalmente, agreguen amigos y vean el backlog público del otro. La app debe seguir funcionando sin cuenta (offline-first).

### Principio clave

```
SQLite (local) ←→ Supabase (cloud, opcional)
     ↑                    ↑
Siempre funciona    Solo si tiene cuenta
```

---

## Stack elegido

| Componente | Tecnología                       |
| ---------- | -------------------------------- |
| Backend    | Supabase                         |
| Auth       | Supabase Auth (email + password) |
| DB Cloud   | PostgreSQL en Supabase           |
| DB Local   | SQLite (se mantiene sin cambios) |
| Cliente    | `@supabase/supabase-js`          |

---

## Schema Supabase (PostgreSQL)

```sql
-- Perfiles públicos
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backlog sincronizado (espejo del SQLite local)
CREATE TABLE game_entries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  igdb_id INTEGER,
  title TEXT NOT NULL,
  cover_url TEXT,
  platform_id INTEGER,
  status TEXT NOT NULL,
  personal_rating INTEGER,
  hours_played REAL DEFAULT 0,
  notes TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solicitudes de amistad
CREATE TABLE friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending | accepted | rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Amigos (se crea al aceptar solicitud)
CREATE TABLE friends (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id)
);
```

### Row Level Security

```sql
-- Solo el dueño puede editar su backlog
ALTER TABLE game_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can do everything"
ON game_entries FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Friends can view public entries"
ON game_entries FOR SELECT
USING (
  is_public = true AND (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM friends
      WHERE user_id = auth.uid()
      AND friend_id = game_entries.user_id
    )
  )
);
```

---

## Cambios al código existente

### 1. Agregar `is_public` al schema SQLite

```ts
// src/db/schema.ts — agregar columna a game_entries
is_public INTEGER DEFAULT 1
```

### 2. Nuevo archivo `src/lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 3. Nuevo store `src/store/auth.store.ts`

```ts
import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";

type AuthStore = {
  session: Session | null;
  user: User | null;
  setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),
}));
```

---

## Nuevas pantallas a crear

```
app/
├── (tabs)/
│   ├── friends.tsx          ← NUEVA tab (lista de amigos + solicitudes)
│   └── ...resto igual
├── auth/
│   ├── login.tsx            ← NUEVA
│   └── register.tsx         ← NUEVA
└── profile/
    ├── [username].tsx       ← NUEVA (ver backlog de un amigo)
    └── edit.tsx             ← NUEVA (editar tu perfil)
```

---

## Flujos principales

### Registro

```
Sin cuenta → app funciona normal (offline)
Settings / About → "Create Account"
→ register.tsx (email + password + username)
→ Supabase crea user
→ App sube backlog local a Supabase en background
→ Usuario tiene perfil público
```

### Login

```
login.tsx → Supabase Auth
→ JWT guardado en AsyncStorage
→ useAuthStore.setSession(session)
→ App sincroniza backlog local ↔ Supabase
```

### Agregar amigo

```
Friends tab → buscar por username o email
→ ver perfil → "Send Request"
→ amigo ve solicitud pendiente en Friends tab
→ acepta o rechaza
→ si acepta → ambos pueden ver el backlog del otro
```

### Sincronización SQLite ↔ Supabase

```
Acción local (agregar/editar/borrar juego)
  → guarda en SQLite (inmediato, siempre)
  → si tiene sesión activa → upsert en Supabase (background)
  → si offline con sesión → cola pendiente en AsyncStorage
  → cuando vuelve internet → procesa cola
```

---

## Dependencias a instalar

```bash
npx expo install @supabase/supabase-js
npx expo install @react-native-async-storage/async-storage
```

---

## Scope MVP v1.1

| Feature                             | Estado            |
| ----------------------------------- | ----------------- |
| Registro con email/password         | Pendiente         |
| Login / Logout                      | Pendiente         |
| Username único                      | Pendiente         |
| Sincronizar backlog a Supabase      | Pendiente         |
| Buscar usuario por username o email | Pendiente         |
| Enviar solicitud de amistad         | Pendiente         |
| Aceptar / Rechazar solicitud        | Pendiente         |
| Ver backlog público de amigo        | Pendiente         |
| App funciona sin cuenta             | Completado (v1.0) |
| App funciona offline con cuenta     | Pendiente         |
| Notificaciones push                 | Post-MVP          |
| Comparar backlog con amigo          | Post-MVP          |
| Feed de actividad                   | Post-MVP          |

---

## Orden de implementación sugerido

1. Crear proyecto en Supabase y aplicar schema SQL
2. Instalar dependencias (`@supabase/supabase-js`, `async-storage`)
3. Crear `src/lib/supabase.ts` y `src/store/auth.store.ts`
4. Agregar `is_public` al schema SQLite local
5. Pantallas de Auth (`login.tsx`, `register.tsx`)
6. Lógica de sincronización SQLite → Supabase
7. Nueva tab `friends.tsx` con búsqueda de usuarios
8. Sistema de solicitudes de amistad
9. Pantalla de perfil público `profile/[username].tsx`

---

## Variables de entorno necesarias

```env
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Notas importantes

- La app está publicada en Google Play y pendiente en App Store
- iOS no muestra links de Ko-fi/PayPal (filtrado con `Platform.OS === 'ios'`)
- El proxy IGDB en Vercel no necesita cambios para esta feature
- Supabase free tier: 500MB DB, 50,000 usuarios activos mensuales
- Auth de Apple es requerida si se usa login social en iOS (regla de Apple)
