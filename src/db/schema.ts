import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('backlog.db');

export function initializeDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      igdb_id INTEGER,
      title TEXT NOT NULL,
      cover_url TEXT,
      summary TEXT,
      release_year INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_entries (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL REFERENCES games(id),
      platform_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'backlog',
      hours_played REAL DEFAULT 0,
      personal_rating INTEGER,
      notes TEXT,
      started_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_entries_status   ON game_entries(status);
    CREATE INDEX IF NOT EXISTS idx_entries_platform ON game_entries(platform_id);
    CREATE INDEX IF NOT EXISTS idx_games_igdb_id    ON games(igdb_id);
  `);
}