import { db } from "../schema";
import { v4 as uuidv4 } from "uuid";
import { Friend, FriendRequest, UserProfile } from "../../types/friends";

// ── User profile ────────────────────────────────────────────────────────────

export function getUserProfile(): UserProfile {
  const row = db.getFirstSync(`SELECT id, name FROM user_profile LIMIT 1`) as {
    id: string;
    name: string;
  } | null;

  if (row) return { id: row.id, name: row.name };

  // First launch: create a profile with a random UUID
  const id = uuidv4();
  db.runSync(`INSERT INTO user_profile (id, name) VALUES (?, ?)`, [
    id,
    "Gamer",
  ]);
  return { id, name: "Gamer" };
}

export function updateUserName(name: string): void {
  db.runSync(`UPDATE user_profile SET name = ?`, [name.trim()]);
}

// ── Friends ──────────────────────────────────────────────────────────────────

export function getFriends(): Friend[] {
  const rows = db.getAllSync(
    `SELECT id, name, added_at FROM friends ORDER BY added_at DESC`,
  ) as { id: string; name: string; added_at: number }[];

  return rows.map((r) => ({ id: r.id, name: r.name, addedAt: r.added_at }));
}

export function addFriend(id: string, name: string): void {
  db.runSync(
    `INSERT OR IGNORE INTO friends (id, name, added_at) VALUES (?, ?, ?)`,
    [id, name, Date.now()],
  );
}

export function removeFriend(id: string): void {
  db.runSync(`DELETE FROM friends WHERE id = ?`, [id]);
}

// ── Friend requests ───────────────────────────────────────────────────────────

export function getPendingRequests(): FriendRequest[] {
  const rows = db.getAllSync(
    `SELECT id, from_id, from_name, received_at
     FROM friend_requests
     ORDER BY received_at DESC`,
  ) as {
    id: string;
    from_id: string;
    from_name: string;
    received_at: number;
  }[];

  return rows.map((r) => ({
    id: r.id,
    fromId: r.from_id,
    fromName: r.from_name,
    receivedAt: r.received_at,
  }));
}

export function saveFriendRequest(fromId: string, fromName: string): void {
  // Ignore if we already have a request from this person
  const existing = db.getFirstSync(
    `SELECT id FROM friend_requests WHERE from_id = ?`,
    [fromId],
  );
  if (existing) return;

  // Also ignore if they're already a friend
  const alreadyFriend = db.getFirstSync(`SELECT id FROM friends WHERE id = ?`, [
    fromId,
  ]);
  if (alreadyFriend) return;

  const id = uuidv4();
  db.runSync(
    `INSERT INTO friend_requests (id, from_id, from_name, received_at) VALUES (?, ?, ?, ?)`,
    [id, fromId, fromName, Date.now()],
  );
}

export function acceptFriendRequest(requestId: string): void {
  const row = db.getFirstSync(
    `SELECT from_id, from_name FROM friend_requests WHERE id = ?`,
    [requestId],
  ) as { from_id: string; from_name: string } | null;

  if (!row) return;

  addFriend(row.from_id, row.from_name);
  db.runSync(`DELETE FROM friend_requests WHERE id = ?`, [requestId]);
}

export function rejectFriendRequest(requestId: string): void {
  db.runSync(`DELETE FROM friend_requests WHERE id = ?`, [requestId]);
}
