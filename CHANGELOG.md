# Changelog

All notable changes to Playlogged are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
