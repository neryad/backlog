<div align="center">

<img src="./assets/icons/ios-dark.jpg" alt="Playlogged Logo" width="120" height="120" style="border-radius: 24px;" />

# Playlogged

**Spend more time playing. Less time managing lists.**

A mobile-first game backlog tracker built for gamers who actually want to play their games.

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=flat)](https://expo.dev)
[![Version](https://img.shields.io/badge/Version-1.6.0-brightgreen?style=flat)](./app.json)

</div>

---

## 📸 Screenshots

> _Screenshots coming soon. Build and run the app to see it in action!_

| Home / Backlog | Game Detail | Stats | Search |
|:-:|:-:|:-:|:-:|
| ![Home](./assets/screenshots/home.png) | ![Detail](./assets/screenshots/detail.png) | ![Stats](./assets/screenshots/stats.png) | ![Search](./assets/screenshots/search.png) |

---

## ✨ Features

### Core
- 🎮 **Multi-platform tracking** — Manage games across PC, PS5, PS4, Xbox, Switch, and Mobile
- 🔍 **Game search via IGDB** — Real covers, release dates, and descriptions from the world's largest games database
- 📋 **Status tracking** — Organize games as Backlog, Playing, Playing (Social), Completed, Paused, Dropped, or Wishlist
- 👆 **Swipe gestures** — Swipe right → Playing, Swipe left → Completed
- 🚀 **Onboarding** — First-launch walkthrough covering the key features
- 🔢 **Filter bar with live counters** — Instantly filter by status with per-status game counts
- ⭐ **Game Detail** — Log your personal rating (1–10), notes, and hours played
- 🎲 **Next to Play** — Break analysis paralysis with three pick strategies: Random, Oldest Added, or Top Rated
- 📊 **Stats screen** — Total games, hours played, average rating, completion rate, breakdown by status, and a monthly recap
- 🌑 **Dark mode UI** — Easy on the eyes for late-night sessions
- 📴 **Offline-first** — Your local data lives on your device via SQLite

### Social & Cloud (optional account)
- 🔐 **Account system** — Optional sign-up/login powered by Supabase Auth
- ☁️ **Cloud sync** — Automatically back up your backlog to Supabase when logged in
- 🔄 **Restore from Cloud** — Pull your cloud data to a new device with one tap
- 👥 **Friends** — Search users, send and accept friend requests, manage your friends list
- 🌐 **Public profiles** — View any user's public backlog at `@username`
- 🎮 **Gaming IDs** — Save and display your PSN, Xbox Gamertag, Nintendo Switch code, Steam, and Epic Games IDs on your profile
- ⚔️ **Game comparison** — Tap "See games in common" on a friend's profile to compare status, hours, and ratings side by side
- 🏆 **Community Top** — Global game ranking aggregated from all user ratings, with weekly rank changes and public reviews

### Share Cards
- 📤 **Shareable image cards** — Export polished cards as PNG images to share anywhere
  - **Stats Card** — Overall progress snapshot with monthly recap (games added, completed, top pick)
  - **Backlog Card** — Top 3 games you're tracking right now
  - **Gaming IDs Card** — All your platform handles in one card
  - **Game Card** — Individual game highlight
- 🎨 **3 visual themes** — Choose between **Minimal**, **Neon**, or **Retro** for Backlog and Gaming ID cards

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev) + [Expo SDK 55](https://expo.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Navigation | [Expo Router](https://expo.github.io/router) (file-based) |
| Local Database | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| UI State | [Zustand](https://zustand-demo.pmnd.rs) + AsyncStorage persistence |
| Server / API State | [TanStack Query](https://tanstack.com/query) |
| Game Data API | [IGDB](https://www.igdb.com/api) via Vercel serverless proxy |
| Auth & Cloud | [Supabase](https://supabase.com) (Auth + Postgres) |
| Secure Storage | [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) |
| Share Cards | [react-native-view-shot](https://github.com/gre/react-native-view-shot) + [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) |
| Gestures | [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| Haptics | [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) |
| Images | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) |
| Fonts | Space Grotesk + JetBrains Mono via [@expo-google-fonts](https://github.com/expo/google-fonts) |
| Icons | [@expo/vector-icons](https://docs.expo.dev/guides/icons/) / Ionicons |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **18+**
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (for production builds)
- A [Twitch Developer](https://dev.twitch.tv/console) account (for IGDB API credentials)
- A [Vercel](https://vercel.com) account (to deploy the IGDB proxy)
- A [Supabase](https://supabase.com) project (for cloud sync and social features)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/playlogged.git
cd playlogged
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

```env
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_IGDB_PROXY_URL=https://your-vercel-proxy.vercel.app/api/games
```

> The app works fully offline without Supabase — cloud sync, auth, and social features are unlocked once valid Supabase credentials are provided.
>
> See the [IGDB Proxy](#-environment-setup-igdb-proxy) and [Supabase Setup](#-supabase-setup) sections for details.

### 3.1 Build environment strategy (recommended)

For EAS builds, do not rely on local `.env` files. Use EAS project secrets per environment:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-supabase-anon-key
eas secret:create --scope project --name EXPO_PUBLIC_IGDB_PROXY_URL --value https://your-vercel-proxy.vercel.app/api/games
```

Then build with the profile you need:

```bash
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android
```

### 3.2 Account deletion backend (optional)

The app can invoke a `delete-account` Edge Function to permanently remove cloud account data while keeping local SQLite data untouched.
If you do not use Edge Functions yet, the app falls back to client-side cloud data cleanup.

Function source:
- `supabase/functions/delete-account/index.ts`

Deploy:

```bash
supabase functions deploy delete-account
```

Required Supabase function secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Run the development server

```bash
npx expo start
```

Then press:
- `i` — open in iOS Simulator
- `a` — open in Android Emulator
- `s` — scan the QR code with [Expo Go](https://expo.dev/go) on your physical device

---

## 🔑 Environment Setup (IGDB Proxy)

Playlogged fetches game data from the [IGDB API](https://api-docs.igdb.com), which requires a Twitch OAuth client. Because Twitch credentials must be kept secret, the app calls a lightweight **Vercel serverless proxy** instead of hitting the IGDB API directly.

### Step 1 — Get Twitch / IGDB credentials

1. Go to [dev.twitch.tv/console](https://dev.twitch.tv/console) and create a new application.
2. Set the OAuth Redirect URL to `http://localhost`.
3. Copy your **Client ID** and **Client Secret**.

### Step 2 — Deploy the IGDB proxy to Vercel

A minimal proxy lives in the `/proxy` directory of this repo (or create one following the pattern below).

```bash
cd proxy
vercel deploy
```

Set the following **Environment Variables** in your Vercel project dashboard:

| Variable | Description |
|---|---|
| `TWITCH_CLIENT_ID` | Your Twitch application Client ID |
| `TWITCH_CLIENT_SECRET` | Your Twitch application Client Secret |

### Step 3 — Connect the app to your proxy

Paste the deployed Vercel URL into your `.env` file:

```env
EXPO_PUBLIC_IGDB_PROXY_URL=https://your-project.vercel.app/api/igdb
```

---

## ☁️ Supabase Setup

Cloud sync, authentication, friend requests, and public profiles all require a Supabase project.

### Step 1 — Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and copy the **Project URL** and **Anon Key** from **Settings → API**.

### Step 2 — Create the required tables

Run the following SQL in the Supabase SQL Editor:

```sql
-- User profiles (auto-created on sign-up via trigger)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  psn_id text,
  Xbox_gamertag text,
  switch_code text,
  steam_id text,
  epic_id text,
  created_at timestamptz default now()
);

-- Public game entries (synced from the app)
create table public.game_entries (
  id text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  igdb_id integer,
  title text not null,
  cover_url text,
  platform_id integer,
  status text not null,
  personal_rating integer,
  hours_played real default 0,
  notes text,
  is_public boolean not null default false,
  created_at timestamptz,
  updated_at timestamptz,
  primary key (user_id, id)
);

-- Friend requests
create table public.friend_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- Accepted friendships
create table public.friendships (
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);
```

### Step 3 — Community Ranking migrations

The community ranking feature requires additional database objects:

```sql
-- Run supabase/migrations/20260607000000_community_ranking.sql
-- Creates: community_ranking view, community_rank_snapshots table,
--          community_reviews view, plus RLS and grants.
```

To enable automatic weekly snapshots (rank change tracking):
1. Enable `pg_cron` and `pg_net` extensions in Supabase Dashboard → Database → Extensions
2. Deploy the Edge Function: `supabase functions deploy weekly-snapshot --no-verify-jwt`
3. Set the `CRON_SECRET` secret in Supabase Dashboard → Edge Functions → Secrets
4. Run the cron schedule: see `supabase/migrations/20260607000001_schedule_weekly_snapshot.sql`

### Step 4 — Connect the app

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📁 Project Structure

```
playlogged/
├── app/                          # Expo Router file-based routes
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── index.tsx             # Home / Backlog screen
│   │   ├── discover.tsx          # Game search / discovery screen
│   │   ├── stats.tsx             # Stats screen (with share card)
│   │   ├── friends.tsx           # Friends & social screen
│   │   └── top.tsx               # Community Top ranking screen
│   ├── community/
│   │   └── game/
│   │       └── [igdbId].tsx      # Community game detail with reviews
│   ├── auth/
│   │   ├── login.tsx             # Login screen
│   │   └── register.tsx          # Register screen
│   ├── profile/
│   │   ├── [username].tsx        # Public profile view
│   │   └── edit-platforms.tsx    # Gaming IDs editor
│   ├── game/
│   │   └── [id].tsx              # Game Detail screen
│   ├── compare/
│   │   └── [username].tsx        # Side-by-side backlog comparison
│   ├── onboarding.tsx            # First-launch onboarding slides
│   └── _layout.tsx               # Root layout (auth gate)
│
├── src/
│   ├── api/                      # IGDB API layer
│   │   └── igdb.client.ts
│   ├── components/               # Shared UI components
│   │   ├── Avatar.tsx
│   │   ├── BacklogShareCard.tsx  # Share card — top games
│   │   ├── GameShareCard.tsx     # Share card — single game
│   │   ├── GamingIdsShareCard.tsx# Share card — platform IDs
│   │   ├── StatsShareCard.tsx    # Share card — stats + monthly recap
│   │   ├── FilterBar.tsx
│   │   ├── GameCard.tsx
│   │   ├── ResponsiveContainer.tsx # Tablet-aware layout wrapper
│   │   ├── SwipeableGameCard.tsx
│   │   ├── SectionLabel.tsx
│   │   └── ui/Text.tsx
│   ├── constants/
│   │   ├── shareCardThemes.ts    # Share card palettes & templates
│   │   ├── typography.ts         # Font family constants
│   │   ├── useAppFonts.ts        # Font loader hook
│   │   ├── colors.ts
│   │   ├── platforms.ts
│   │   └── theme.ts
│   ├── db/                       # SQLite database layer
│   │   ├── schema.ts
│   │   └── queries/
│   │       ├── game.ts
│   │       └── stats.ts
│   ├── features/
│   │   ├── backlog/
│   │   ├── search/
│   │   ├── stats/
│   │   ├── next-to-play/
│   │   ├── about/
│   │   └── top/                  # Community Top ranking feature
│   │       ├── useCommunityRanking.ts
│   │       ├── useCommunityGameDetail.ts
│   │       ├── RankBadge.tsx
│   │       └── RankingListItem.tsx
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── sync.ts               # Backlog → Supabase sync helpers
│   │   └── backup.ts             # Cloud restore logic
│   ├── store/
│   │   ├── auth.store.ts         # Supabase session store
│   │   └── ui.store.ts           # UI state (filters, sort, share template)
│   ├── types/
│   │   ├── game.ts
│   │   ├── igdb.types.ts
│   │   └── igdb.mapper.ts
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useDeviceSize.ts
│   └── utils/
│       ├── week.ts               # Week helper for community ranking
│       └── share.ts              # View-shot + expo-sharing helpers
│
├── assets/                       # Images, fonts, icons
├── proxy/                        # Vercel IGDB proxy (serverless)
├── supabase/
│   ├── functions/
│   │   ├── delete-account/       # Edge function for account deletion
│   │   └── weekly-snapshot/      # Edge function for community ranking snapshots
│   └── migrations/               # Database migrations
├── app.json
├── eas.json
├── CHANGELOG.md
├── .env.example
└── README.md
```

---

## 🗺️ Roadmap

- [x] **Friends & sharing** — Send friend requests, view friends' public backlogs, share stat/backlog/gaming-ID cards
- [x] **Cloud sync** — Optional Supabase-backed backup for logged-in users
- [x] **Public profiles** — Share your backlog at `@username`
- [ ] **iCloud / Google Drive sync** — Optional cloud backup without an account
- [ ] **Playtime tracking** — Built-in session timer per game
- [ ] **Custom shelves** — Create named collections beyond the default statuses
- [ ] **Import / Export** — Migrate from other trackers via CSV or JSON
- [ ] **Widgets** — iOS and Android home screen widgets for current game
- [ ] **Completion achievements** — Milestone badges (10 games, 50 hours, etc.)
- [x] **iPad / tablet layout** — Optimised split-view for larger screens
- [ ] **Notifications** — Reminders to pick up a game you haven't touched in weeks

---

## 📋 Legal

Playlogged takes your privacy seriously. Local-only mode involves no accounts, no tracking, and no data collection. Cloud features (sync, profiles) are opt-in and powered by Supabase.

| Document | Summary |
|---|---|
| 📄 [Privacy Policy](./PRIVACY_POLICY.md) | What data the app does (and doesn't) collect, and how third-party services like IGDB and Supabase are used |
| 📜 [Terms of Service](./TERMS_OF_SERVICE.md) | Usage rules, intellectual property, and limitations of liability |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please make sure your code:
- Passes TypeScript checks — `npx tsc --noEmit`
- Follows the existing file and folder conventions
- Includes sensible commit messages ([Conventional Commits](https://www.conventionalcommits.org) preferred)

For major changes, please open an issue first to discuss what you'd like to change.

> By submitting a pull request, you agree that your contributions are made under the same [MIT License](./LICENSE) and that you have read the [Terms of Service](./TERMS_OF_SERVICE.md).

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

## 👤 Developer

Built with ❤️ by **[Neryad]**

| | |
|---|---|
| 🐙 GitHub | [@neryad](https://github.com/neryad) |
| 🐦 Twitter / X | [@NeryadG](https://twitter.com/NeryadG) |
| 🌐 Website | [neryad.dev](https://neryad.dev) |
| ☕ Support | [Buy me a coffee](https://ko-fi.com/neryad) |
| 📄 Privacy Policy | [View](./PRIVACY_POLICY.md) |
| 📜 Terms of Service | [View](./TERMS_OF_SERVICE.md) |

---

<div align="center">

If Playlogged helped you finally start chipping away at your backlog, consider leaving a ⭐ on the repo!

</div>
