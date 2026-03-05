<div align="center">

<img src="./assets/images/icon.png" alt="Playlogged Logo" width="120" height="120" style="border-radius: 24px;" />

# Playlogged

**Spend more time playing. Less time managing lists.**

A mobile-first game backlog tracker built for gamers who actually want to play their games.

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=flat)](https://expo.dev)

</div>

---

## 📸 Screenshots

> _Screenshots coming soon. Build and run the app to see it in action!_

| Home / Backlog | Game Detail | Stats | Search |
|:-:|:-:|:-:|:-:|
| ![Home](./assets/screenshots/home.png) | ![Detail](./assets/screenshots/detail.png) | ![Stats](./assets/screenshots/stats.png) | ![Search](./assets/screenshots/search.png) |

---

## ✨ Features

- 🎮 **Multi-platform tracking** — Manage games across PC, PS5, PS4, Xbox, Switch, and Mobile
- 🔍 **Game search via IGDB** — Real covers, release dates, and descriptions from the world's largest games database
- 📋 **Status tracking** — Organize games as Backlog, Playing, Completed, Dropped, or Wishlist
- 👆 **Swipe gestures** — Swipe right → Playing, Swipe left → Completed
- 🔢 **Filter bar with live counters** — Instantly filter by status with per-status game counts
- ⭐ **Game Detail** — Log your personal rating (1–10), notes, and hours played
- 🎲 **Next to Play** — Break analysis paralysis with three pick strategies: Random, Oldest Added, or Top Rated
- 📊 **Stats screen** — Total games, hours played, average rating, completion rate, and breakdown by status
- 🌑 **Dark mode UI** — Easy on the eyes for late-night sessions
- 📴 **Offline-first** — No account, no cloud, no tracking. Your data lives on your device

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev) + [Expo SDK 55](https://expo.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Navigation | [Expo Router](https://expo.github.io/router) (file-based) |
| Local Database | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| UI State | [Zustand](https://zustand-demo.pmnd.rs) |
| Server / API State | [TanStack Query](https://tanstack.com/query) |
| Game Data API | [IGDB](https://www.igdb.com/api) via Vercel serverless proxy |
| Gestures | [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| Haptics | [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) |
| Images | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) |
| Icons | [@expo/vector-icons](https://docs.expo.dev/guides/icons/) / Ionicons |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **18+**
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (for production builds)
- A [Twitch Developer](https://dev.twitch.tv/console) account (for IGDB API credentials)
- A [Vercel](https://vercel.com) account (to deploy the IGDB proxy)

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
EXPO_PUBLIC_IGDB_PROXY_URL=https://your-vercel-proxy.vercel.app/api/igdb
```

> See the [Environment Setup](#-environment-setup-igdb-proxy) section for how to obtain and configure IGDB credentials.

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

## 📁 Project Structure

```
playlogged/
├── app/                        # Expo Router file-based routes
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── index.tsx           # Home / Backlog screen
│   │   ├── search.tsx          # Game search screen
│   │   └── stats.tsx           # Stats screen
│   ├── game/
│   │   └── [id].tsx            # Game Detail screen
│   └── _layout.tsx             # Root layout
│
├── src/
│   ├── api/                    # IGDB API layer
│   │   └── igdb.ts
│   ├── components/             # Shared UI components
│   │   ├── GameCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── ...
│   ├── db/                     # SQLite database layer
│   │   ├── schema.ts           # Table definitions
│   │   └── queries/            # Per-feature query modules
│   │       ├── games.ts
│   │       └── stats.ts
│   ├── features/               # Feature-first modules
│   │   ├── backlog/
│   │   ├── search/
│   │   ├── stats/
│   │   └── nextToPlay/
│   └── store/                  # Zustand global stores
│       └── useBacklogStore.ts
│
├── assets/                     # Images, fonts, icons
├── proxy/                      # Vercel IGDB proxy (serverless)
├── app.json                    # Expo app configuration
├── eas.json                    # EAS Build configuration
├── .env.example                # Environment variable template
└── README.md
```

---

## 🗺️ Roadmap

These features are planned for post-MVP releases:

- [ ] **iCloud / Google Drive sync** — Optional cloud backup of your library
- [ ] **Playtime tracking** — Built-in session timer per game
- [ ] **Custom shelves** — Create named collections beyond the default statuses
- [ ] **Import / Export** — Migrate from other trackers via CSV or JSON
- [ ] **Widgets** — iOS and Android home screen widgets for current game
- [ ] **Completion achievements** — Milestone badges (10 games, 50 hours, etc.)
- [ ] **Friends & sharing** — Share your backlog or completion lists publicly
- [ ] **iPad / tablet layout** — Optimised split-view for larger screens
- [ ] **Notifications** — Reminders to pick up a game you haven't touched in weeks

---

## 📋 Legal

Playlogged takes your privacy seriously — no accounts, no tracking, no data collection. Everything stays on your device.

| Document | Summary |
|---|---|
| 📄 [Privacy Policy](./PRIVACY_POLICY.md) | What data the app does (and doesn't) collect, and how third-party services like IGDB are used |
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
