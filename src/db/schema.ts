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
      updated_at INTEGER NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_entries_status     ON game_entries(status);
    CREATE INDEX IF NOT EXISTS idx_entries_platform   ON game_entries(platform_id);
    CREATE INDEX IF NOT EXISTS idx_entries_created_at ON game_entries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_entries_game_id    ON game_entries(game_id);
    CREATE INDEX IF NOT EXISTS idx_games_igdb_id      ON games(igdb_id);
  `);

  // Migration: add is_public to existing databases that predate this column.
  try {
    db.execSync(
      `ALTER TABLE game_entries ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0`,
    );
  } catch {
    // Column already exists — safe to ignore.
  }
}