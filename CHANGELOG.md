# Changelog

All notable changes to Playlogged are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [1.4.0] - 2026-05-28
### Added
- Tablet/iPad support with responsive layout
  - Sidebar navigation replaces bottom tab bar on tablets (width ≥ 768 pt)
  - `useDeviceSize` hook with `isTablet`, `isLandscape`, and `isLargeTablet` flags
  - `ResponsiveContainer` and `TwoColumnContainer` components for adaptive layouts
  - Game detail screen adapted for tablet with wider content and improved spacing
- Restore from Cloud: signed-in users can pull their data from Supabase to a new device or after reinstall (About bottom sheet → Data → Restore from Cloud)
- `src/lib/backup.ts` — cloud restore engine that fetches game entries from Supabase and rebuilds the local SQLite database
- `restoreVersion` counter in UI store — triggers automatic refresh on all screens after restore

### Changed
- Game detail screen: notes TextInput now properly scrolls into view when keyboard opens on Android
  - Removed `KeyboardAvoidingView` to prevent layout jumps
  - `keyboardDidShow` listener + `scrollTo` with measured position for reliable scroll

### Fixed
- Crash on screen rotation caused by a hook called after a conditional return in `TabsLayout`
- Home screen not refreshing after cloud restore — `useBacklog` now watches `restoreVersion` to reload data immediately

## [1.3.1] - 2026-05-10
### Added
- Profile avatar via URL — shown across all profile views

### Changed
- App update notifications improved:
  - Minor/patch updates show a dismissible modal with 24-hour cooldown
  - Major version updates (e.g. 1.x → 2.x) show a required update modal with no dismiss option
  - Fails silently if network or store lookup is unavailable

### Fixed
- "Update Now" button not opening the App Store on device
- App Store URL region mismatch for users outside the US
- `@babel/runtime` peer dependency flag in package-lock.json

## [1.3.0] - 2026-05-10
### Added
- App update detection: users are notified when a new version is available on the App Store/Play Store
  - Major version bumps force the update modal without a dismiss option
- `useAppUpdateCheck` hook (`src/hooks/useAppUpdateCheck.ts`)
- `UpdateModal` component (`src/components/UpdateModal.tsx`)
- TypeScript type declarations for `react-native-version-check`
- Profile info button accessible from every main tab (Home, Discover, Friends, Stats)

### Changed
- `UpdateModal` integrated in root layout (`app/_layout.tsx`)

## [1.2.0] - 2026-05-01
### Added
- First-launch onboarding screen with 5 illustrated slides
- Onboarding covers: backlog organization, swipe gestures, Next to Play, share & connect
- `hasSeenOnboarding` flag persisted in AsyncStorage — onboarding never shown again after completion
- Game comparison feature in ProfileScreen with "See games in common" button
- Compare screen with side-by-side status, hours played, and personal ratings

### Changed
- `paused` status added to GAME_STATUS_THEMES with full theme support

## [1.1.2] - 2026-04-29
### Added
- Sent friend requests management in FriendsScreen
- Share inline card and ShareModal components for sharing game entries
- Gaming IDs share card with preview
- `paused` and `dropped` statuses to game entries with action labels
- Staging environment configuration in eas.json

### Changed
- DiscoverScreen: improved search UI and empty state handling
- FriendsScreen: enhanced layout and search functionality
- StatsScreen: streamlined imports and improved share functionality
- AboutModal: updated layout and account management interactions
- GameDetailScreen: improved state management and UI responsiveness
- Upgraded Expo and related packages to latest minor versions
- Refactored color and typography usage across components

## [1.1.1] - 2026-04-27
### Changed
- Profile status colors updated and refined

## [1.1.0] - 2026-04-26
### Added
- `is_public` field for game entries (public/private backlog toggle)
- Expo SecureStore integration for improved secure data handling
- Improved error handling and loading indicators across FriendsScreen and ProfileScreen
- `EXPO_PUBLIC_APP_URL` environment variable support

### Changed
- Friends loading logic refactored for better performance and error handling
- Account deletion method updated in AboutModal
- Sync functions enhanced with entry mapping
- Database queries optimized across components

## [1.0.1] - 2026-03-23
### Added
- Share cards for backlog, stats, and individual games (3 themes: Minimal, Neon, Retro)
- Monthly recap share card in StatsScreen
- Gaming IDs share card
- Share preview toggle in share section
- "Playing (Social)" status for multiplayer games
- Dynamic action labels in AddGameSheet based on selected status
- Sort options in backlog screen

### Changed
- Share card components refactored to use APP_NAME constant
- async-storage dependency adjusted

## [1.0.0] - 2026-03-04
### Added
- Initial release of Playlogged
- Game backlog management with 7 statuses: Backlog, Playing, Completed, Dropped, Paused, Wishlist, Playing (Social)
- Game search via IGDB API
- Swipe gestures on game cards (right = Playing, left = Completed)
- "Next to Play" picker with 3 strategies: Random, Oldest Added, Top Rated
- Stats screen with gaming analytics
- Social features: friend requests, public profiles, backlog sync
- Share backlog and stats as themed cards
- Platform support: PSN, Xbox, Switch, Steam, Epic Games
- Dark mode UI with Space Grotesk + Inter + JetBrains Mono typography
- SQLite local database with Supabase cloud sync
- Authentication (email/password)
